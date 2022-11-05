require(["gitbook", "jQuery"], function(gitbook, $) {
    /** code代码 */
    function handleCode() {
        $('pre').each(function() {
            var code = $(this).children('code');
            if (code && code.html()) {
                var sourceCode = code.text();
                var lines = code.html().split('\n');
                // 删除多余空行
                if (lines[lines.length - 1] == '') {
                    lines.splice(lines.length - 1, 1);
                }
                lines = lines.map(line => '<span class="myibu-code-line">' + line + '</span>');
                // 创建一个新div元素
                var codeWrapper = $('<div class="myibu-code-wrapper"></div>');
                codeWrapper.append('<pre class="myibu-code">\n' 
                                    + lines.join('\n') 
                                    + '</pre>\n');
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
            }
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
            // 添加展开按钮
            var firstElement = _this.children()[0];
            $(firstElement).addClass("myibu-chapter-span");
            var expandBtn = $('<i class="myibu-chapter-expand-btn"></i>');
            // 需要icon
            var ulElements =  _this.children("ul");
            if (ulElements.length > 0) {
                expandBtn.addClass("myibu-chapter-expand-icon fa fa-plus-square-o");
                expandBtn.click(function() {
                    if (expandBtn.attr('class').indexOf("fa-minus-square-o") != -1) {
                        expandBtn.removeClass("fa-minus-square-o");
                        expandBtn.addClass("fa-plus-square-o");
                        $(ulElements[0]).hide();
                    } else {
                        expandBtn.removeClass("fa-plus-square-o");
                        expandBtn.addClass("fa-minus-square-o");
                        $(ulElements[0]).show();
                    }
                });
                // 默认不展开
                $(ulElements[0]).hide();
            }
            // 添加到元素内
            expandBtn.prependTo($(firstElement));
       });
        // 显示选中
        $('.active').parents().each(function() {
            // 选中的元素父级目录均展开
            $(this).show(); 
            // 处理icon
            $(this).filter(".chapter").each(function(){
                var firstElement = $(this).children()[0];
                $(firstElement).children().filter('i.myibu-chapter-expand-icon').each(function() {
                    $(this).removeClass("fa-plus-square-o");
                    $(this).addClass("fa-minus-square-o");
                });
            });
        });

        // 隐藏侧边栏
       var showBtn =  $('<i class="fa fa-angle-left myibu-chapter-show-btn" title="隐藏侧边栏"></i>');
       if (isMobileDevice()) {
            showBtn.removeClass("fa-angle-left");
            showBtn.addClass("fa-angle-right");
            showBtn.attr('title', '展开侧边栏');
            $('.book').removeClass("with-summary");
       } else {
            showBtn.removeClass("fa-angle-right");
            showBtn.addClass("fa-angle-left");
            showBtn.attr('title', '隐藏侧边栏');
            $('.book').addClass("with-summary");
       }
       showBtn.click(function(){
        if (showBtn.attr('class').indexOf("fa-angle-left") != -1) {
            showBtn.removeClass("fa-angle-left");
            showBtn.addClass("fa-angle-right");
            showBtn.attr('title', '展开侧边栏');
            $('.book').removeClass("with-summary");
        } else {
            showBtn.removeClass("fa-angle-right");
            showBtn.addClass("fa-angle-left");
            showBtn.attr('title', '隐藏侧边栏');
            $('.book').addClass("with-summary");
        }
       })
       $('.book').append(showBtn);
    }

    /** 移动设备，小屏 */
    function isMobileDevice() {
        return $(window).width() <= 600;
    }

    function fillPageInnerNavDiv(h, parent) {
        if (h.children.length == 0) {
            if (!h.isRoot) {
                parent.append($("<li><a href='#" + h.url + "'>" + h.name + "</a></li>"));
            }
        } else {
            if (!h.isRoot) {
                parent.append($("<li><a href='#" + h.url + "'>" + h.name + "</a></li>"));
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
            constructor(level, url, name){
                this.level = level;
                this.url = url;
                this.name = name;
                this.children = [];
                this.isRoot = (level == 0);
            }
        }
        var headers = [];
        var root = new PageInnerHeader(0, '', '');
        headers.push(root);
        $(':header').each(function (i, elem) {
            console.log(elem)
            var id = $(elem).attr('id');
            if (id && $(elem).text()) {
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
                    headers.push(new PageInnerHeader(level, id, $(elem).text()));
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

    /** 菜单栏导航 */
    function handleTopMenu(config) {
        // 先移除菜单栏
        var searchDiv = $('div#book-search-input');
        $('nav.myibu-top-menu').remove()
        var gitbookRoot = gitbook.state.root;
        var topMenus = [];
        // 默认添加首页菜单
        topMenus.push({"url": gitbookRoot, "name": "首页"});
        // 小屏幕只显示“首页”
        if (!isMobileDevice()) {
            if (config && config.topMenus && (config.topMenus instanceof Array)) {
                config.topMenus.forEach((item, index) => {
                    topMenus.push(item);
                });
            }
        }
        var topMenuDiv = $('<nav class="myibu-top-menu"></nav>');
        var topMenuUl  = $('<ul></ul>');
        topMenus.forEach((item, index) => {
            // 默认首页是激活状态
            if (item.url == gitbookRoot) {
                topMenuUl.append($("<li><a class='myibu-top-menu-active' href='" + item.url + "'>" + item.name + "</a></li>"));
            } else {
                topMenuUl.append($("<li><a href='" + item.url + "'>" + item.name + "</a></li>"));
            }
        })
        topMenuDiv.append(topMenuUl);
        
        var topActionsDiv = $('<div class="myibu-top-menu-actions"></div>');
        topActionsDiv.append(searchDiv);
        topMenuDiv.append(topActionsDiv)
        // 添加至book元素第一个
        topMenuDiv.prependTo($('.book'));
    }

    /** 页内导航 */
    function handlePageHeader() {
        var pageHeader = $('<div class="myibu-page-header"></div>');
        if (gitbook.state.config.author) {
            pageHeader.append($('<span><i class="fa fa-user" title="作者"></i> ' + gitbook.state.config.author + '</span>'));
        } else {
            pageHeader.append($('<span><i class="fa fa-user" title="作者"></i> ' + 匿名用户 + '</span>')); 
        }
        
        pageHeader.append($('<span><i class="fa fa-columns" title="文章标题"></i> ' + gitbook.state.chapterTitle + '</span>'));
        
        var lastModifyTime = new Date(gitbook.state.file.mtime);
        var lastModifyDate = lastModifyTime.getFullYear() + "年" + (lastModifyTime.getMonth()+1) + "月" + lastModifyTime.getDate() + "日";
        pageHeader.append($('<span><i class="fa fa-calendar" title="最后修改于"></i> ' + lastModifyDate + '</span>'));
        
        pageHeader.append($('<hr>'));
        pageHeader.prependTo($('.page-inner'));
    }

    function onPageChanged(config) {
        handleCode();
        handleImgPopup();
        handleExpand();
        handlePageInnerNav();
        handleTopMenu(config);
        handlePageHeader();
    }

    gitbook.events.bind('start', function (e, config) {
        var myibuConfig = config.myibuConfig;
        handleTopMenu(myibuConfig);
    });

    gitbook.events.bind("page.change", function() {
        var myibuConfig = gitbook.state.config.pluginsConfig.myibuConfig;
        onPageChanged(myibuConfig);
    });
});