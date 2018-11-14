const preventDefaultAllLinks = () => {
  var a = document.getElementsByTagName("a");
  for (var i = 0; i < a.length; ++i) {
    a[i].addEventListener(
      "click",
      function() {
        e.preventDefault();
      },
      false
    );
  }
};

export default preventDefaultAllLinks;
