[English README](./README.en.md)

## 注意

新加入抓取 [Microsoft Azure Architecture Center](https://github.com/xiaohanyu/blog-html-to-pdf/blob/master/Microsoft.md) 文章的程序。程序调用方式已经[变更](https://github.com/xiaohanyu/blog-html-to-pdf/commit/80518f3a09fc3e2f15658dcc97e9819f5d720fc7#diff-168726dbe96b3ce427e7fedce31bb0bc)，如果按照些说明文档操作抓取 Brendan Gregg 文章，请 `git reset --hard d8cc3c2`。

## 简介

事情是这样的，我的一位朋友是 [Brendan Gregg](http://www.brendangregg.com/) 的粉丝（啊，我也是），想把他的 [blog](http://www.brendangregg.com/blog/) 保存成 PDF，放到 kindle 上随时研读，群里讨论起来，就聊起来有没有一些好的办法能够把 130 篇文章由 HTML 转成 PDF。

简单想了下，要解决这个问题，有三个步骤：

- 拿到 130 篇 blog 文章的 URL
- 将每篇文章由 HTML 转换成 PDF
- 最后再将转换后的 PDF 合成一个大的 PDF 文件

重点在于前两步。

### 拿到所有 blog 文章的 URL

第一步，拿到一个网站或者多个网站的所有 URL，本质上是一个爬虫问题。
[wget](https://www.gnu.org/software/wget/) 是一个非常好用的下载工具，除了下载单个文件，wget 还可以下载一整个网站并将网站的链接转换成本地链接。

我们用下面的命令拿到 brendan gregg 网站的所有链接：

```sh
wget --spider -r http://www.brendangregg.com/blog/ 2>&1 | grep '^--' | awk '{ print $3 }' | grep -v '\.\(css\|js\|png\|gif\|jpg\|JPG\)$' > /tmp/urls.txt
```

我们发现 brendan gregg 网站的 blog 的 URL 非常有规律：

```
http://www.brendangregg.com/blog/2008-12-02/a-quarter-million-nfs-iops.html
http://www.brendangregg.com/blog/2008-12-15/up-to-2gbs-nfs.html
http://www.brendangregg.com/blog/2008-12-15/up-to-2gbs-nfs.html
http://www.brendangregg.com/blog/2009-01-09/1gbs-nfs-from-disk.html
http://www.brendangregg.com/blog/2009-01-09/1gbs-nfs-from-disk.html
```

于是我们用如下的命令过滤出所有 blog 文章的 URL：

```
cat /tmp/urls.txt | grep 'blog/2' | grep '.html$' | sort | uniq > blog.txt
```

到此，第一步完成。

### 将文章由 HTML 转换成 PDF

接下来，我们要将 130 篇文章全部由 HTML 转换成 PDF。

显然，手工做是不可以滴。批量转换必须用到 [headless browser](https://en.wikipedia.org/wiki/Headless_browser)。

前几年 headless browser 的事实标准是 [PhantomJS](http://phantomjs.org/)，不过后来
Chrome 团队放了个大招 [puppeteer](https://github.com/GoogleChrome/puppeteer)，基本上算宣告了 PhantomJS 寿终正寝。

我们可以用下面的代码将 HTML 网页转存成 PDF：

```js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'});
  await page.pdf({path: 'hn.pdf', format: 'A4'});

  await browser.close();
})();
```

略微[封装](https://github.com/xiaohanyu/blog-html-to-pdf/blob/master/index.js#L26-L40)一下，我们可以将 130 篇 blog 文章全部转换成 PDF。

需求注意的问题：

- JS 中写异步代码并不是特别舒服，如有可能，用 `async`/`await` 的方式，写起来舒服很多
- Puppeteer 本质上是一个 chrome，页面多的话相当耗资源，因此 HTML 转存 PDF 的时候需要控制下频率，每次截图之后关闭 page，并 `sleep(10000)`。我第一版的代码没有注意到这个问题并且为了调试同时 disable 了 headerless 选项 （`const browser = await puppeteer.launch({headless: false}`），直接导致电脑内存耗光，出现了数十个 chromium 共存的感人画面：

<img src="./screenshots/hundreds-of-chromium.png" width="1440">

完整的截图代码在[这里](https://github.com/xiaohanyu/blog-html-to-pdf/blob/master/index.js)。

运行：

```sh
yarn
mkdir output
node index.js
```

<img src="./screenshots/capture-by-puppeteer.png" width="1440">

### 合并 PDF

大概花十几分钟的样子，我们可以拿到约 130 篇文章的 PDF，接下来我们将 130 篇 PDF 合并成一个大的 PDF 文件，这样可以方便在移动设备上管理和阅读。

合并 PDF 的工具相当多，专业的如 Adobe Acrobat，命令行的工具有
[PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/)。

Mac 上可以用 [ghostscript](https://www.ghostscript.com/)

```sh
brew install ghostscript
```

合并 PDF 可以用类似下面的命令：

```sh
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=merged.pdf pdf1.pdf pdf2.pdf
```

我们用 `ls -t` 命令列出所有的 PDF 文件，并按照文件的 modifed time 进行排序（`man ls` 命令
查看 `-t` 参数的含义）。

如此，我们得到下面的命令：

```sh
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=merged.pdf `ls -t`
```

大约一两分钟的样子，130 个 PDF 合并成一个 640+ 页的 PDF。我提供两种版本下载：

- [brendan-gregg-sort-by-alpha.pdf](https://github.com/xiaohanyu/blog-html-to-pdf/blob/master/dist/brendan-gregg-sort-by-alpha.pdf)
- [brendan-gregg-sort-by-date.pdf](https://github.com/xiaohanyu/blog-html-to-pdf/blob/master/dist/brendan-gregg-sort-by-date.pdf)


### 思考

一呢，其实如果将 PDF 放到 kindle 这种小尺寸的设备上阅读的话，puppeteer 的截图参数还可以再改一下。我在程序里的设定是按照 A4 尺寸转换成 PDF，如果放到 kindle 上阅读，用 A5 的尺寸转 PDF 也许阅读效果会更好一点，这个时候，web 这种流式排版——[流式排版](https://www.douban.com/note/575242910/)这个名词是我自创的，嗯——在适配不同尺寸设备方面就显示出了巨大的优势。

二，如果做一个类似的 web 服务，会有人愿意买单么？

三，[工具的强是无敌的](https://blog.youxu.info/2008/03/10/tools-everywhere/)……
