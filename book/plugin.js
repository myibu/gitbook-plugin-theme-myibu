require(["gitbook", "jQuery"], function(gitbook, $) {
    /** code代码 */
    function handleCode() {
        $('pre').each(function() {
            var code = $(this).children('code');
            var sourceCode = code.text();
            var lines = code.html().split('\n');
            // 删除多余空行
            if (lines[lines.length - 1] == '') {
                lines.splice(lines.length - 1, 1);
            }
            lines = lines.map(line => '<pre class="myibu-code-line">' + line + '</pre>');
            // 创建一个新div元素
            var codeWrapper = $('<div class="myibu-code-wrapper"></div>');
            codeWrapper.append('<div class="myibu-code">\n' 
                                + lines.join('\n') 
                                + '</div>\n');
            // 复制按钮
            var codeCopy = $('<div class="myibu-code-copy">复制</div>');
            codeCopy.click(function() {
                const textarea = document.createElement('textarea');
                textarea.setAttribute('readonly', 'readonly');
                textarea.value = sourceCode;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                codeCopy.text("复制成功")
                document.body.removeChild(textarea);
                // 倒计时恢复
                window.setTimeout(function(){codeCopy.text("复制")}, 1000);
            });

            codeWrapper.append(codeCopy);

            // 复制按钮隐藏
            codeWrapper.hover(function(){
                codeCopy.show();
            },function(){
                codeCopy.hide();
            });
            
            $(this).replaceWith(codeWrapper);
        });
    }

    /** 图片弹出 */
    function handleImgPopup() {
        $('img').each(function() {
            var _this = $(this);
            // 添加放大按钮
            _this.addClass("myibu-img");
            // 添加监听
            _this.click(function() {
                $(".myibu-img-wrapper").remove();
                $(".book").append(function(){
                    // 添加图片蒙层
                    var imgWrapper = $('<div class="myibu-img-wrapper"></div>');
                    imgWrapper.click(function(){ $(".myibu-img-wrapper").remove(); });

                    var img = $('<img class="myibu-img-popup" src="' + _this.attr("src") + '" alt="' + _this.attr("alt") + '">');
                    img.click(function() { $(".myibu-img-wrapper").remove(); });

                    imgWrapper.append(img);
                    return imgWrapper;
                });
            });
        });
    }

    /** 章节目录折叠 */
    function handleExpand() {
        $('.chapter').each(function() {
            var _this = $(this);
            var ulElements =  _this.children("ul");
            if (ulElements.length > 0) {
                var firstElement = _this.children()[0];
                $(firstElement).addClass("myibu-chapter-span");
                var expandBtn =  $('<span class="iconfont icon-expand myibu-chapter-expand-btn"></span>');
                expandBtn.insertBefore($(firstElement));
                $(ulElements[0]).hide();
                expandBtn.click(function(){
                    if (expandBtn.attr('class').indexOf("icon-expanded") != -1) {
                        expandBtn.removeClass("icon-expanded");
                        expandBtn.addClass("icon-expand");
                        $(ulElements[0]).hide();
                    } else {
                        expandBtn.removeClass("icon-expand");
                        expandBtn.addClass("icon-expanded");
                        $(ulElements[0]).show();
                    }
                })
            } else {
                var firstElement = _this.children()[0];
                $(firstElement).addClass("myibu-chapter-span");
                $('<span class="myibu-chapter-expand-btn"></span>').insertBefore($(firstElement));
            }
            // 显示选中
            $('.active').parents().filter(".chapter").each(function(){
                $(this).children('span.myibu-chapter-expand-btn').each(function() {
                    $(this).removeClass("icon-expand");
                    $(this).addClass("icon-expanded");
                });
                $(this).children().each(function() {
                    $(this).show(); 
                });
            });
       });

       var showBtn =  $('<span class="iconfont icon-summary-hide myibu-chapter-show-btn" title="隐藏侧边栏"></span>');
       showBtn.click(function(){
        if (showBtn.attr('class').indexOf("icon-summary-hide") != -1) {
            showBtn.removeClass("icon-summary-hide");
            showBtn.addClass("icon-summary-show");
            showBtn.attr('title', '展开侧边栏');
            $('.book').removeClass("with-summary");
        } else {
            showBtn.removeClass("icon-summary-show");
            showBtn.addClass("icon-summary-hide");
            showBtn.attr('title', '隐藏侧边栏');
            $('.book').addClass("with-summary");
        }
       })
       $('.book').append(showBtn);
    }

    function fillPageInnerNavDiv(h, parent) {
        if (h.children.length == 0) {
            if (!h.isRoot) {
                parent.append($("<li><a href='#" + h.url + "'>" + h.url + "</a></li>"));
            }
        } else {
            if (!h.isRoot) {
                parent.append($("<li><a href='#" + h.url + "'>" + h.url + "</a></li>"));
            }
            var subParent = $('<ul></ul>');
            parent.append(subParent);
            for (let i = 0; i < h.children.length; i++) {
                fillPageInnerNavDiv(h.children[i], subParent);
            }
        }
    }

    /** 页内导航 */
    function handlePageInnerNav() {
        class PageInnerHeader {
            constructor(level, url){
                this.level = level;
                this.url = url;
                this.children = [];
                this.isRoot = (level == 0);
            }
        }
        var headers = [];
        var root = new PageInnerHeader(0, '');
        headers.push(root);
        $(':header').each(function (i, elem) {
            var id = $(elem).attr('id');
            if (id) {
                var level = 4;
                if ($(elem).is('h1')) {
                    level = 1;
                } else if ($(elem).is('h2')) {
                    level = 2;
                } else if ($(elem).is('h3')) {
                    level = 3;
                }
                // 最多处理3级目录
                if (level < 4) {
                    headers.push(new PageInnerHeader(level, id));
                }
            }
        });
        for (let i=1; i<headers.length; i++) {
            for (let j=i-1; j >=0; j--) {
                // 找到第一个比当前层级小的header
                if (headers[j].level < headers[i].level) {
                    headers[j].children.push(headers[i]);
                    break;
                }
            }
        }
        var pageInnerNavDiv = $('<div class="myibu-page-inner-nav"><div class="myibu-page-inner-nav-title">本页内容</div></div>');
        fillPageInnerNavDiv(root, pageInnerNavDiv);
        if (headers.length > 1) {
            var pageInnerNavDivWrapper = $('<div class="myibu-page-inner-nav-wrapper"></div>');
            pageInnerNavDivWrapper.append(pageInnerNavDiv);
            $('.page-wrapper').append(pageInnerNavDivWrapper);
        }
    }

    gitbook.events.bind('start', function (e, config) {
        console.log(config)
    });
    
    
    gitbook.events.bind("page.change", function() {
       handleCode();
       handleImgPopup();
       handleExpand();
       handlePageInnerNav();
    });
});