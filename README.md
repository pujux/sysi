<h3 align="center">
  <img src="https://user-images.githubusercontent.com/17516174/88907881-767c4780-d259-11ea-883a-48380c849a0e.png" alt="sysi" height="100px">
</h3>
<p align="center">A command-line tool to display system information written in Node.</p>

<p align="center">
  <a href="https://github.com/puf17640/sysi/LICENSE.md"><img src="https://img.shields.io/github/license/puf17640/sysi"></a>
  <!-- <a href="https://github.com/puf17640/sysi/releases"><img src="https://img.shields.io/github/release/puf17640/sysi.svg"></a><br/> -->
  <a href="https://github.com/puf17640/sysi/issues"><img src="https://img.shields.io/github/issues-raw/puf17640/sysi"></a>
  <a href="https://badges.pufler.dev"><img src="https://badges.pufler.dev/visits/puf17640/sysi?label=visits"></a>
</p>

<div align="left">
  <h2>Installation:</h2>
  <code>npm install -g sysi</code>
</div>

<div align="right">
  <h2>Configuration:</h2>
  sysi can be customized by editing the JSON configuration file located in the directory where sysi was installed in.
  
  <h4>Main Settings</h4>
  <ul>
    <li>seperator - string</li>
    <li>suffix - string</li>
    <li>title - boolean</li>
    <li>titleColor - string</li>
    <li>primaryColor - string</li>
    <li>secondaryColor - string</li>
    <li>seperatorColor - string</li>
    <li>suffixColor - string</li>
    <li>seperatorLength - number</li>
  </ul>
  
  <h4>Parts</h4>
  All parts can be turned off by either removing them from the JSON configuration or by setting the "enabled" property to false.
  <ul>
    <li>os
      <ul>
        <li>enabled - boolean</li>
        <li>version - boolean</li>
        <li>arch - boolean</li>
      </ul>
    </li>
    <li>cpu
      <ul>
        <li>enabled - boolean</li>
        <li>cores - boolean</li>
        <li>speed - boolean</li>
        <li>temp - boolean</li>
      </ul>
    </li>
    <li>uptime
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
    <li>gpu
      <ul>
        <li>enabled - boolean</li>
        <li>vram - boolean</li>
      </ul>
    </li>
    <li>memory
      <ul>
        <li>enabled - boolean</li>
        <li>percent - boolean</li>
      </ul>
    </li>
    <li>display
      <ul>
        <li>enabled - boolean</li>
        <li>mainOnly - boolean</li>
      </ul>
    </li>
    <li>proc
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
    <li>battery
      <ul>
        <li>enabled - boolean</li>
        <li>timeRemaining - boolean</li>
      </ul>
    </li>
    <li>ping
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
    <li>publicIp
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
    <li>net
      <ul>
        <li>enabled - boolean</li>
        <li>noLocal - boolean</li>
      </ul>
    </li>
    <li>shell
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
    <li>users
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
    <li>cpuLoad
      <ul>
        <li>enabled - boolean</li>
      </ul>
    </li>
  </ul>
</div>
