function setsize() {
    var winW = document.documentElement.clientWidth||document.body.clientWidth,
        winH = document.documentElement.clientHeight||document.body.clientHeight,
        baseFontSize = 50,
        baseWidth = 375,
        winWidthSize = Math.min(winW, winH);
    if (winWidthSize > 375) {
        winWidthSize = 375;
    }
    if (winWidthSize < 270) {
        winWidthSize = 270;
    }
    var _html = document.getElementsByTagName('html')[0];
    _html.style.fontSize =winWidthSize / baseWidth * baseFontSize + 'px';
}
setsize();