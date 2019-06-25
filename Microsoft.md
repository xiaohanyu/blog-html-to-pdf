## Microsoft Azure Architecture Center

[Microsoft Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/) 的文章写得不错，特别是 [Cloud design patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/) 部分，我觉得写得相当好，很有参考价值。

因为我将原来的[程序](https://github.com/xiaohanyu/blog-html-to-pdf/blob/d8cc3c2/index.js) 略做更改，抓取了 460+ 页文章，合成一个 pdf 文档，总计约 2300 多页。

抓取 URL 方面，没有采用 wget 的方式，偷懒用手工方式抓取到了所有的 url。

原理大概是这样的：

```js
let links = [];
let aElements = document.querySelectorAll("#affixed-left-container a");

for (let i = 0; i < aElements.length; i++) {
    links.push(a.href);
}
```

通过 `document.querySelectorAll("#affixed-left-container a")` 拿到侧边导航栏的所有 `a` 元素。这里有个坑是，Microsoft Azure Architecture Center 这个网页的侧边栏导航似乎是
延迟加载的，因此必须将所有 `ul` 元素手工展开，否则 `ul` 元素下的 `a` 为空。我暂时没有找到很好的方式用 JavaScript 的方式模拟展开这些元素，因此花了五六分钟手工展开了所有 `ul` 元素，然后拿到了所有文章的 [URL](https://github.com/xiaohanyu/blog-html-to-pdf/blob/master/microsoft.txt)。

我将原来 [index.js](https://github.com/xiaohanyu/blog-html-to-pdf/blob/d8cc3c2/index.js) 略做[改动](https://github.com/xiaohanyu/blog-html-to-pdf/commit/80518f3a09fc3e2f15658dcc97e9819f5d720fc7#diff-168726dbe96b3ce427e7fedce31bb0bc)，令其支持 pdf 抓取输出目录及 url 列表文件。

调用方式：

```sh
node index.js output/microsoft microsoft.txt
```

如果约花半小时时间，将 460 篇文章抓取完毕，合并 pdf 于此，enjoy。