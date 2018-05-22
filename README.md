AstroBox Software - Fork to fix "manual instalation from oryginal source". 
=================
For now, it was tested on:
-------
-BeagleBone Black / Green.
-------
-OrangePi zero
-------

Link to oryginal project: https://github.com/AstroPrint/AstroBox

Current status
-------

I was able to run AstroPrint software on my BBB and I get confirmation that it also works on OrangePi zero. My WiFi dongle is not supporting AstroBox AP functionality, so I don't know if it will work with supported one. WiFi works fine, I was able to connect to AstroPrint cloud and even do a software update. Main feature - connection with printer - also works without problem. So, enjoy the AstroPrint functionality on Beaglebone or OrangePi! If you test it on other platforms, please let me know, I will add it to the list of supported devices. 

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
Your device should reboot a few times.  

7. Execute
AstroPrint should start on boot. You can also start it manually:
<pre>
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
