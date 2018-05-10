#!/bin/bash

ROOT_NAME=$(lsblk -o name,mountpoint,label,size,uuid | grep rootfs | cut -b 7- | cut -d ' ' -f1)
ROOT_PART="/dev/$ROOT_NAME"
PART_NUM=$(echo $ROOT_NAME | cut -d 'p' -f2)
if [ "$PART_NUM" = "$ROOT_PART" ]; then
  echo "/dev/root is not an SD card. Don't know how to expand"
  return 0
fi

LAST_PART_NUM=$(parted /dev/mmcblk0 -ms unit s p | tail -n 1 | cut -f 1 -d:)

if [ "$LAST_PART_NUM" != "$PART_NUM" ]; then
  echo "/dev/root is not the last partition. Don't know how to expand"
  return 0
fi

# Get the starting offset of the root partition
PART_START=$(parted /dev/mmcblk0 -ms unit s p | grep "^${PART_NUM}" | cut -f 2 -d: | cut -d 's' -f1)
[ "$PART_START" ] || return 1
# Return value will likely be error for fdisk as it fails to reload the
# partition table because the root fs is mounted
fdisk /dev/mmcblk0 <<EOF
p
d
$PART_NUM
n
p
$PART_NUM
$PART_START
 
 
p

EOF

reboot
