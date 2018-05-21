#!/bin/bash

if [ ! -f /etc/apt/sources.list.d/astroprint.ppa.list ]; then
  DEBIAN_VERSION=`cat /etc/debian_version | cut -c -1`
  case "$DEBIAN_VERSION" in
    9)
    DEBIAN_NAME="stretch"
  ;;
    *)
    DEBIAN_NAME="stable"
  ;;
  esac

  echo "Adding AstroPrint's PPA [${DEBIAN_NAME}] for future updates..."
  echo "deb [trusted=yes] http://ppa.astroprint.com ${DEBIAN_NAME} main" > /etc/apt/sources.list.d/astroprint.ppa.list
  apt-get update
fi

if [ ! -f /etc/apt/sources.list.d/tmp_rpi.ppa.list ]; then
  echo "deb http://mirrordirector.raspbian.org/raspbian/ jessie main contrib non-free rpi" > /etc/apt/sources.list.d/tmp_rpi.ppa.list
  apt-get update
fi

echo "Installing python packages..."
apt-get --assume-yes --allow-unauthenticated install python2.7 python-pip python-dev python-apt python-dbus python-gobject isc-dhcp-server ruby ruby-sass network-manager haproxy janus=0.2.5-1 gir1.2-gstreamer-1.0 gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-omx gcodeanaylizer-astroprint astrobox-pip-dependencies

rm /etc/apt/sources.list.d/tmp_rpi.ppa.list

cp /AstroBox/toInstall/* /. -rf
sync

if ! cmp -s /etc/haproxy/haproxy_astrobox.cfg /etc/haproxy/haproxy.cfg; then
  echo "Setting up haproxy..."
  mv /etc/haproxy/haproxy_astrobox.cfg /etc/haproxy/haproxy.cfg
  service haproxy reload
fi

if ! cmp -s /etc/bind/named.conf.options.astrobox /etc/bind/named.conf.options; then
  echo "Setting up local DNS"
  mv /etc/bind/named.conf.options.astrobox /etc/bind/named.conf.options
  mv /etc/bind/named.conf.local.astrobox /etc/bind/named.conf.local
fi

echo "Enabling powercheck to start on bootup..."
update-rc.d -f powercheck defaults

echo "Enabling astrobox to start on bootup..."
update-rc.d -f astrobox defaults

if [ -f /etc/os-release ]; then
  . /etc/os-release

  echo $ID
  if [ "raspbian" == "$ID" ]; then
    echo "Adding Raspicam V4l2 driver"
    if grep -Fxq "bcm2835-v4l2" /etc/modules; then
        echo "Already there"
    else
        echo "Adding driver"
        echo 'bcm2835-v4l2' >> /etc/modules
    fi
  fi
fi

systemctl disable bonescript.socket
systemctl disable bonescript-autorun.service

reboot
