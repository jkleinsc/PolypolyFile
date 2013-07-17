PolypolyFile
============

What happens you try to use the FileSystem API polyfill on top of the IndexedDB polyfill?

1. There is a polyfill for the FileSystem API (//github.com/ebidel/idb.filesystem.js/), that relies on IndexedDB.
2. There is a polyfill for the IndexedDB API that relies on WebSQL (https://github.com/axemclion/IndexedDBShim).
3. Can you use polyfill #1 on top of polyfill #2?
4. If you can, the FileSystem API can be used in most browsers, including Safari and mobile Safari(iOS).

When I started this project, it turned out that the IndexedDB polyfill simply used 
JSON.stringify/JSON.decode to mimic the <a href="">Structured Cloning Algorithm</a>.  This meant 
that the FileSystem polyfill didn't work because it was using Blobs to save the files 
in the IndexedDB.  Blobs get converted to null when you attempt to convert them using JSON.stringify.

After examining the IndexedDB polyfill, I decided to properly implement the Structured 
Cloning Algorithm for that polyfill.  That implementation has been accepted as a pull 
request for the IndexedDB polyfill:  <a href="https://github.com/axemclion/IndexedDBShim/pull/68">GitHub pull request</a>

What you see in this project is an example of the FileSystem polyfill and the 
IndexedDB polyfill working together to allow upload of photos to a local filesystem
from a (mobile) Safari browser.  This example should work in most browsers.