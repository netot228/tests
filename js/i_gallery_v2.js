"use strict"

function iGalleryV2(props){
    let root = props.root || null;
    if(!root instanceof HTMLElement) return;

    let limit = props.limit || null;

    let leftBtn         = root.querySelector('.leftbtn');
    let rightBtn        = root.querySelector('.rightbtn');
    let zoombtn         = root.querySelector('.zoombtn');
    let closeBtn        = root.querySelector('.closebtn');
    let textToggleBtn   = root.querySelector('.text_toggle_btn');

    let mainarea        = root.querySelector('.mainarea');
    let slider          = root.querySelector('.mainarea-wrapper');

    let itemsArr        = Array.from(mainarea.querySelectorAll('.item'));
    let arrSize         = itemsArr.length;

    let preview         = root.querySelector('.preview') || null;
    let previewSlider   = null;
    let previewItemsArr = null;
    if(preview){
        previewSlider   = preview.querySelector('.preview-wrapper');
        previewItemsArr = preview.querySelectorAll('.item');
        previewItemsArr.forEach(el=>{
            el.addEventListener('click', ()=>{
                let itemNum = +el.dataset.item;
                changeItem(itemNum);
            })
        })
    }

    let signPlace       = root.querySelector('.signplace');
    let quantityNum     = root.querySelector('.quantity-num');
    let quantitySum     = root.querySelector('.quantity-sum');

    let infoblock       = root.querySelector('.infoblock');
    let curItem         = 0;

    let inTotalImg;

    if(itemsArr[arrSize-1].nodeName!='FIGURE'){
        inTotalImg = arrSize-1;
    } else {
        inTotalImg = arrSize;
    }

    quantitySum.innerHTML = inTotalImg;

    // check browser and version
    let safariVersion = null;
    if(navigator.userAgent.match(/AppleWebKit.*Version.*Safari/i)){
        let version = navigator.userAgent.match(/version\/(\d+)\./i);
        if(Array.isArray(version)){
            safariVersion = +version[1];
        }
    }

    if(!limit && location.search.match(/photo_num=(\d+)/)){
        let requiredPhoto = +location.search.match(/photo_num=(\d+)/)[1] - 1;
        if(requiredPhoto>=0 && requiredPhoto<arrSize){
            let needItem = itemsArr[requiredPhoto];
            if(needItem){
                curItem = requiredPhoto;
                changeItem(curItem, 'instant');
            }
        }
    } else {
        quantityNum.innerHTML = '1';
    }

    function slideMove(pos, behavior){
        if(safariVersion && safariVersion<16){
            slider.scroll({top: 0, left: pos, behavior: 'instant'});
        } else {
            slider.scroll({top: 0, left: pos, behavior: behavior ? behavior : 'smooth'});
        }
    }
    function loadSrc(itemNum, once){
        let itemImage =  itemsArr[itemNum].querySelector('.item-image');

        if(itemImage && itemImage.getAttribute('src')==''){
            let img = new Image();
            img.src = itemImage.dataset.src;
            img.onload = ()=>{
                itemImage.src = itemImage.dataset.src;
            }
        }

        if(itemImage && itemImage.dataset.hq){
            let imgHq = new Image();
            imgHq.src = itemImage.dataset.hq;
            imgHq.onload = ()=>{
                itemImage.src = itemImage.dataset.hq;
            }
        }


        if(!once){
            // siblings image src check
            if(itemsArr[curItem-1]){
                loadSrc(curItem-1, 'once');
            }
            if(itemsArr[curItem+1]){
                loadSrc(curItem+1, 'once');
            }
        }
    }

    function setCaption(itemNum){

        let itemImage =  itemsArr[itemNum].querySelector('.item-image') || null;
        if(itemImage){
            let caption = '';
            if(itemImage.dataset.caption!=''){
                caption += `<p>${itemImage.dataset.caption}</p>`;
            }
            if(itemImage.dataset.author!=''){
                caption += `<i>${itemImage.dataset.author}</i>`;
            }
            signPlace.innerHTML = caption;
        }

    }

    function addUrlParams(itemNum){

        if(!limit){

            let currentUrl = location.origin + location.pathname;
            let curPhoto = itemNum + 1;

            if(location.search != '') {

                if(location.search.match(/photo_num=\d+/)) {
                    currentUrl =  currentUrl + location.search.replace(/photo_num=\d+/, 'photo_num=' + curPhoto);
                } else {
                    
                    currentUrl =  currentUrl + location.search + '&photo_num=' + curPhoto;
                }

            } else {
                currentUrl = currentUrl + '?p=main&photo_num=' + curPhoto;
            }

            history.replaceState(null, '', currentUrl);

            if(window.g_gazeta_counters_reload){
                g_gazeta_counters_reload();
            }
        }

    }

    function previewItemHolder(itemNum){
        if(preview){
            let activeItem = preview.querySelector('.item.active');
            activeItem.classList.remove('active');

            activeItem = previewItemsArr[itemNum];
            activeItem.classList.add('active');

            if(safariVersion && safariVersion<16){
                activeItem.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'instant'});
            } else {
                activeItem.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'});
            }
        }
    }

    function changeItem(itemNum, slideMoveType){

        if(itemNum == itemsArr.length-1){
            rightBtn.classList.add('disable');
        } else {
            rightBtn.classList.remove('disable');
        }
        if(itemNum == 0){
            leftBtn.classList.add('disable');
        } else {
            leftBtn.classList.remove('disable');
        }

        loadSrc(itemNum);
        slideMove(itemsArr[itemNum].offsetLeft, slideMoveType);
        setCaption(itemNum);
        addUrlParams(itemNum);
        previewItemHolder(itemNum);

        if(itemNum<inTotalImg){
            quantityNum.innerHTML = itemNum+1;
        }
        
    }

    rightBtn.addEventListener('click', ()=>{
        if(rightBtn.classList.contains('disable')) return;
        changeItem(++curItem);
    })
    leftBtn.addEventListener('click', ()=>{
        if(leftBtn.classList.contains('disable')) return;
        changeItem(--curItem);
    })

    zoombtn.addEventListener('click',()=>{

    })

}