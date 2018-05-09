AstroBox Software - Fork to fix "manual instalation from oryginal source". I will test it on my BeagleBone Black.
=================

Link to oryginal project: https://github.com/AstroPrint/AstroBox

Current status
-------

I was able to run AstroPrint software on my BBB. I tested it without WiFi dongle so, all AP functionality doesn't work for now, but I was able to reach AstroPrint web page via ethernet and also via ssh reverse tunnelling from my mobile phone. In next week I should test more things. Connection with the printer is still not tested.

Installation instructions
-------

1. Install Debian on BBB
  - Get image from: https://beagleboard.org/latest-images
  - I used IoT version but in future will try to get the version with GUI to add my 7 inch LCD to it
2. Instal dependencies:
- TODO
<pre>
  sudo apt-get install ruby ruby-sass network-manager python-dbus python-apt
</pre>
2. Clone git repo (from BBB)
<pre>
  cd ~
  git clone https://github.com/bula87/AstroBox.git
</pre>
3. Copy it to correct location
<pre>
  cd ~
  sudo cp AstroBox/* /. -r
  sync
</pre>
4. Reboot the BBB
<pre>
  sudo reboot
</pre>
5. Execute
<pre>
  service astrobox start
</pre>
6. Check if it works
  - open in the web browser: http://<YOUR-BBB-IP>:5000
7. If someone will want it, I can also explain how securely access your AstroBox from outside the LAN via ssh reverse tunnelling.


Setting up the virtual printer
-------

TODO
