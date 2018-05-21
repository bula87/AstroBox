AstroBox Software - Fork to fix "manual instalation from oryginal source". 
=================
For now, it was tested on:
=================
-BeagleBone Black / Green.
=================
-OrangePi zero
=================

Link to oryginal project: https://github.com/AstroPrint/AstroBox

Current status
-------

I was able to run AstroPrint software on my BBB. I tested it without WiFi dongle so, all AP functionality doesn't work for now, but I was able to reach AstroPrint web page via ethernet and also via ssh reverse tunnelling from my mobile phone. In next week I should test more things. Connection with the printer is still not tested.
I was even able to update software via AstroPrint updating procedure... Looks promising!

Installation instructions
-------

1. Install Debian on device (BeagleBone or other)
  - Get image from: https://beagleboard.org/latest-images
  - I used IoT version but in future will try to get the version with GUI to add my 7 inch LCD to it
2. Connect your device to internet (ethernet is recommended)  
3. Ssh to your device:
<pre>
  ssh USER_NAME@IP_OF_YOUR_BOX
</pre>
4. ON YOUR DEVICE: Go to linux root directory: 
<pre>
  cd /
</pre>
5. ON YOUR DEVICE: Clone git repository:
<pre>
  sudo git clone https://github.com/bula87/AstroBox.git
</pre>
6. ON YOUR DEVICE: Setup enviroment
<pre>
  sudo /AstroBox/setup.sh
</pre>
BBB should reboot a few times 
7. Execute
<pre>
  AstroPrint should start on boot. You can also start it manually:
  service astrobox start
</pre>
8. Check if it works
<pre>
  Open in the web browser: http://YOUR-DEVICE-IP:80
</pre>
9. If someone will want it, I can also explain how securely access your AstroBox from outside the LAN via ssh reverse tunnelling.


Setting up the virtual printer
-------

TODO
