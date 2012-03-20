'use strict';

/*
 * requires js-epub, found at https://github.com/augustl/js-epub
 */
var mover = null;

/*
 * TODO: Preview function only. Should be removed from final version.
 */

function preview()
{
  document.getElementById('menu').style.display = 'none';
  var reader = new FileReader();
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'books/ImportancePreview.txt', true)
  xhr.send(null);

  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4)
    {
      bookFromText(xhr.responseText);
    }
  }


  document.addEventListener('mousedown',
      function(evt) {mover = new moving(evt);},
      false);

  document.addEventListener('mousemove',
      function(evt) {mover.mouseMove(evt);},
      false);

  document.addEventListener('mouseup',
      function(evt) {mover.mouseEnd(evt);},
      false);

  /* menu event listeners */
  var back = document.getElementById('back');
  var toggle = document.getElementById('toggle');
 
  back.addEventListener('click',
      function() {resetBook();},
      false);

  toggle.addEventListener('click',
      function() {toggleStyle();},
      false);
}
  
function update(file)
{
  document.getElementById('menu').style.display = 'none';
  var reader = new FileReader();
  if(file.item(0).type.indexOf('epub') > -1)
  {
    reader.readAsBinaryString(file.item(0));
    reader.onload = function(event)
    {
      createBook(reader.result);
    };
  } else {
    reader.readAsText(file.item(0));
    reader.onload = function(event)
    {
      bookFromText(reader.result);
    }
  }

  /* swiping event listeners */
  document.addEventListener('mousedown',
      function(evt) {mover = new moving(evt);},
      false);

  document.addEventListener('mousemove',
      function(evt) {mover.mouseMove(evt);},
      false);

  document.addEventListener('mouseup',
      function(evt) {mover.mouseEnd(evt);},
      false);

  /* menu event listeners */
  var back = document.getElementById('back');
  var toggle = document.getElementById('toggle');
 
  back.addEventListener('click',
      function() {resetBook();},
      false);

  toggle.addEventListener('click',
      function() {toggleStyle();},
      false);

}

var book;
function createBook(epub)
{
  book = new JSEpub(epub);
  book.processInSteps(function(step, extras)
  {
    if (step === 5) {

      var fileBox = document.getElementById('fileHolder');
      fileBox.style.display = 'none';
      showChapter();
    }
  });
}

function bookFromText(txt)
{

  var style = document.createElement('style');
  style.id = 'pageStyle';
  document.body.appendChild(style);
  var pages = document.getElementById('pages'); 
  pages.innerHTML = txt;
  buildPages();
  var fileBox = document.getElementById('fileHolder');
  fileBox.style.display = 'none';
}

function resetBook() {
    book = null;
    document.getElementsByTagName('input')[0].value = '';
    document.getElementById('fileHolder').style.display = 'block';
    document.getElementById('pages').innerHTML = '';
    chapter = 0;
    page = 0;
    document.getElementById('menu').style.display = 'none';
}

var page = 0;
var chapter = 0;
function showChapter(dir) {
  if(book && book.opf.spine[chapter])
  {
    var spine = book.opf.spine[chapter];
    var href = book.opf.manifest[spine]['href'];
    var doc = book.files[href];
    var html = new XMLSerializer().serializeToString(doc);
    var bookBox = document.getElementById('pages');
    bookBox.innerHTML = html;
    buildPages();
    chapter += 1;
  } else {
    resetBook();
  }
}

function buildPages()
{
  document.getElementById('pageStyle').innerHTML = '';
  var scrollMaxY = (window.scrollMaxY) ? 
    window.scrollMaxY :
    document.documentElement.scrollHeight - 
      document.documentElement.clientHeight;
  var totalHeight = (window.innerHeight + scrollMaxY);
  var contentWidth = window.innerWidth;

  if (totalHeight - 40 > window.innerHeight)
  {
    var pageRatio = totalHeight / window.innerHeight;
    contentWidth = (window.innerWidth > window.innerHeight) ?
       (pageRatio * window.innerWidth) + (window.innerWidth) :
      (pageRatio * window.innerHeight) + window.innerHeight;

    var numCols = Math.ceil(contentWidth / (window.innerWidth - 80));
    contentWidth = numCols * window.innerWidth;
  }
  var style = '#pages{' +
    ' -moz-column-width: ' + (window.innerWidth - 80) + 'px!important;' + 
    ' -webkit-column-width: ' + (window.innerWidth - 80) + 'px!important;' +
    ' width: ' + contentWidth + 'px!important;' +
    '-moz-column-gap: 80px;' +
    '-webkit-column-gap: 80px;' +
    'margin-left: 40px;}';

    document.getElementById('pageStyle').innerHTML = style;
}
function nextPage(dir) {
  var pages = document.getElementById('pages');
  if ((page + dir) * (window.innerWidth + 1) >= pages.clientWidth) 
  {
    showChapter(dir);
    page = 0;
    pages.setAttribute('style', '-moz-transform: translate(0, 0);'+
        '-webkit-transform: translate(0, 0);');
    return;
  }
  pages.setAttribute('style',
      '-moz-transform: translate(-' +
        ((page + dir) * (window.innerWidth) - (page )) + 'px, 0);' +
      '-webkit-transform: translate(-' + 
        ((page + dir) * (window.innerWidth) - (page )) + 'px, 0);');

        pages.style.MozTransition = 'all 0.2s ease 0s';
        pages.style.WebkitTransition='all 0.2s ease 0s';

  page += dir;
}

function toggleMenu() {
  var menu = document.getElementById('menu');
  if (menu.style.display === 'none')
  {
    menu.style.display = 'block';
    return;
  }
  menu.style.display = 'none';
  /*
   * TODO: Make menus for useful functions
   * Primarily back to menu, page jump, bookmark(?)
   */
}

function toggleStyle() {
  var style = document.getElementById('style');
  if (style.getAttribute('href') === 'style/dark.css')
  {
    style.setAttribute('href', 'style/light.css');
    return;
  }
  style.setAttribute('href', 'style/dark.css');
}

var moving = function(evt) {
  this.pageStyle = document.getElementById('pages').style;
  this.startTime = evt.timeStamp;
  this.startX = evt.screenX;
  this.active = true;
};

moving.prototype = {
  mouseMove: function(callingEvt) {
    if (this.active === true)
    {
        var offset = callingEvt.screenX - this.startX;
        this.pageStyle.MozTransform = 'translateX(-' +
            ((page * (window.innerWidth + 1)) + (-1 * offset)) + 'px)';
        this.pageStyle.WebkitTransform = 'translateX(-' +
            ((page * (window.innerWidth + 1)) + (-1 * offset)) + 'px)';
        this.pageStyle.MozTransition = 'all 0s ease 0s';
        this.pageStyle.WebkitTransition='all 0s ease 0s';
    }
  },

  mouseEnd: function(callingEvt) {
      this.active = false;
      var offset = callingEvt.screenX - this.startX;
      if ((callingEvt.timeStamp - this.startTime) < 250) {
        toggleMenu();
        this.pageStyle.MozTransform = 'translateX(-' +
            ((page + dir) * (window.innerWidth) + (page * 3)) + 'px)';
        this.pageStyle.WebkitTransform = 'translateX(-' +
            ((page + dir) * (window.innerWidth) + (page * 3)) + 'px)';

    } else if ((-1 * offset > (window.innerWidth / 4)) ||
        offset > (window.innerWidth / 4)) {

        var dir = offset > 0 ? -1 : 1;
        nextPage(dir);
        mover = null;

    } else {
        this.pageStyle.MozTransform = 'translateX(-' +
            (((page) * (window.innerWidth)) - (page * 10)) + 'px)';
        this.pageStyle.WebkitTransform = 'translateX(-' +
            (((page) * (window.innerWidth)) - (page * 10)) + 'px)';
    }
  }
};

window.onload = function()
{
  var fileBox = document.getElementsByTagName('input')[0];
  fileBox.addEventListener('change',
      function() {update(fileBox.files);},
      false);
    var previewer = document.getElementById('preview');
    previewer.addEventListener('click', preview, false);

  var pageStyle = document.createElement('style');
  pageStyle.id = 'pageStyle';
  document.body.appendChild(pageStyle);

};

