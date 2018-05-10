AstroBox Software - Fork to fix "manual instalation from oryginal source". I will test it on my BeagleBone Black.
=================

Link to oryginal project: https://github.com/AstroPrint/AstroBox

Current status
-------

I was able to run AstroPrint software on my BBB. I tested it without WiFi dongle so, all AP functionality doesn't work for now, but I was able to reach AstroPrint web page via ethernet and also via ssh reverse tunnelling from my mobile phone. In next week I should test more things. Connection with the printer is still not tested.
I was even able to update software via AstroPrint updating procedure... Looks promising!

Installation instructions
-------

1. Install Debian on BBB
  - Get image from: https://beagleboard.org/latest-images
  - I used IoT version but in future will try to get the version with GUI to add my 7 inch LCD to it
2. Clone git repo (from BBB)
<pre>
  cd /
  sudo git clone https://github.com/bula87/AstroBox.git
</pre>
3. Setup enviroment
<pre>
  sudo /AstroBox/setup.sh
</pre>
BBB should reboot a few times
4. Execute
<pre>
  AstroPrint should start on boot. You can also start it manually:
  service astrobox start
</pre>
5. Check if it works
<pre>
  Open in the web browser: http://<YOUR-BBB-IP>:5000
</pre>
6. If someone will want it, I can also explain how securely access your AstroBox from outside the LAN via ssh reverse tunnelling.


Setting up the virtual printer
-------

TODO
