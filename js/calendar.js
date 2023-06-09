/*

    income
            parentNode  - HTMLElement || querySelect string
            options = {
                needHours:      Boolean - add or not hours block
                setDateTime:    Number  - timestamp milliseconds
            }
*/


class IDateTime {

    // legends
    days = ['m', 't', 'w', 't', 'f', 's', 's'];

    months = [  'January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

    //detect mobile
    isMobile = (function () {
        if (/iPhone|iPod|iPad|Android|Windows Phone|\bWindows(?:.+)ARM\b|BlackBerry|BB10|Opera Mini|\b(CriOS|Chrome)(?:.+)Mobile|Mobile(?:.+)Firefox\b/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        }
    })();

    constructor(parentNode, options) {


        if (parentNode instanceof HTMLElement) {
            this.parent = parentNode;
        } else if (typeof parentNode == 'string') {
            this.parent = document.querySelector(parentNode);
        } else {
            throw new Error("IDateTime is waiting for the DOM element");
        }

        if(!this.parent){
            throw new Error("IDateTime is waiting for the DOM element");
        }

        this.needHoursFlag = options.needHours || false;
        this.defaultValue = options.defaultValue || null;

        this.dateNow    = this.defaultValue ? new Date( this.defaultValue) : new Date();
        this.year       = this.dateNow.getFullYear();
        this.month      = this.dateNow.getMonth();
        this.day        = this.dateNow.getDate();
        this.hour       = this.dateNow.getHours();
        this.min        = this.dateNow.getMinutes();

        // generate DOM

            this.home = document.createElement('div');
            this.home.className = '_i_datetime';
            this.home.id = '__i_datetime_id_' + Math.floor(Math.random()*10000);


            this.parent.append(this.home);

            // pseudo input block
                this.input = document.createElement('div');
                this.input.className = '_i_datetime-input';
                this.home.append(this.input);

                this.inputDay = document.createElement('input');
                this.inputDay.className = '_i_datetime-input-value';
                this.inputDay.type = 'text';
                this.inputDay.placeholder = 'dd';
                this.inputDay.size = 2;
                this.inputDay.dataset.min = 1;
                this.inputDay.dataset.max = 31;
                this.inputDay.dataset.type = 'day';
                this.inputDay.dataset.value = this.day;

                this.inputMonth = document.createElement('input');
                this.inputMonth.className = '_i_datetime-input-value';
                this.inputMonth.type = 'text';
                this.inputMonth.placeholder = 'mm';
                this.inputMonth.size = 2;
                this.inputMonth.dataset.min = 1;
                this.inputMonth.dataset.max = 12;
                this.inputMonth.dataset.type = 'month';
                this.inputMonth.dataset.value = this.month;

                this.inputYear = document.createElement('input');
                this.inputYear.className = '_i_datetime-input-value';
                this.inputYear.type = 'text';
                this.inputYear.placeholder = 'yyyy';
                this.inputYear.size = 4;
                this.inputYear.dataset.min = 1900;
                this.inputYear.dataset.max = 2100;
                this.inputYear.dataset.type = 'year';
                this.inputYear.dataset.value = this.year;

                let inputDateSeparator = document.createElement('div');
                inputDateSeparator.className = '_i_datetime-input-separator';
                inputDateSeparator.innerText = '.';
                this.input.append(  this.inputDay,
                                    inputDateSeparator,
                                    this.inputMonth,
                                    inputDateSeparator.cloneNode(true),
                                    this.inputYear)

                if (this.needHoursFlag) {

                    this.inputHourWrapper = document.createElement('div');
                    this.inputHourWrapper.className = '_i_datetime-input-hourwrapper';

                    this.inputHour = document.createElement('input');
                    this.inputHour.className = '_i_datetime-input-value';
                    this.inputHour.type = 'text';
                    this.inputHour.placeholder = '--';
                    this.inputHour.size = 2;
                    this.inputHour.dataset.min = 0;
                    this.inputHour.dataset.max = 23;
                    this.inputHour.dataset.type = 'hour';
                    this.inputHour.dataset.value = this.hour;

                    this.inputMin = document.createElement('input');
                    this.inputMin.className = '_i_datetime-input-value';
                    this.inputMin.innerText = '--';
                    this.inputMin.type = 'text';
                    this.inputMin.placeholder = '--';
                    this.inputMin.size = 2;
                    this.inputMin.dataset.min = 0;
                    this.inputMin.dataset.max = 59;
                    this.inputMin.dataset.type = 'min';
                    this.inputMin.dataset.value = this.min;

                    let inputHourSeparator = document.createElement('div');
                    inputHourSeparator.className = '_i_datetime-input-separator';
                    inputHourSeparator.innerText = ':';

                    this.inputHourWrapper.append(this.inputHour, inputHourSeparator, this.inputMin);
                    this.input.append(this.inputHourWrapper);

                }

                this.inputBtn = document.createElement('div');
                this.inputBtn.className = '_i_datetime-input-btn';

                this.input.append(this.inputBtn);

                if(this.defaultValue){
                    this.setValue(this.defaultValue);
                }

                this.input.querySelectorAll('input').forEach(el=>{
                    el.addEventListener('focus', e=>{
                        this.closeSelectors();
                        this.pickerCloser(e);
                        this.inputHolder(el, e);
                    })
                    el.addEventListener('input', e=>{
                        this.inputHolder(el, e);
                    })
                    el.addEventListener('keydown', e=>{
                        this.inputHolder(el, e);
                    })
                    el.addEventListener('blur', e=>{

                        //set the value if it is empty
                        this[el.dataset.type] = el.dataset.value;

                        if(el.dataset.type != 'hour' && el.dataset.type != 'min' && !+el.value){
                            el.value = el.dataset.type == 'month' ? 1+ (+el.dataset.value) : el.dataset.value;
                            this.inputHolder(el, e);
                        }

                        if(this.isMobile){
                            if(el.dataset.type=='year'){
                                el.value = el.dataset.value;
                            } else {
                                if(el.value.toString().length < 2){
                                    el.value = '0' + el.value;
                                }
                            }
                        }

                    })
                })

            // END pseudo input block

            // picker

                this.picker = document.createElement('div');
                this.picker.className = '_i_datetime-picker';
                this.home.append(this.picker);

                this.pickerHeader = document.createElement('div');
                this.pickerHeader.className = '_i_datetime-picker-header';
                this.picker.append(this.pickerHeader);

                this.monthSelector = document.createElement('div');
                this.monthSelector.className = '_i_datetime-picker-header-selector';
                this.pickerHeader.append(this.monthSelector);

                this.monthWrapper = document.createElement('div');
                this.monthWrapper.className = 'wrapper';
                this.monthSelector.append(this.monthWrapper);

                for (let i = 0; i < this.months.length; i++) {
                    let item = document.createElement('div');
                    item.className = 'item';

                    if(this.month == i){
                        item.classList.add('selected');
                    }
                    item.innerText = this.months[i];
                    item.dataset.month = i;

                    item.addEventListener('click', ()=>{
                        this.selectHolder(this.monthSelector, item, this.year, item.dataset.month);
                    })

                    this.monthWrapper.append(item);
                }

                this.yearSelector = document.createElement('div');
                this.yearSelector.className = '_i_datetime-picker-header-selector';
                this.pickerHeader.append(this.yearSelector);

                this.yearWrapper = document.createElement('div');
                this.yearWrapper.className = 'wrapper';
                this.yearSelector.append(this.yearWrapper);

                for (let i = 1970; i<this.year + 50; i++){
                    let item = document.createElement('div');
                    item.className = 'item';

                    if(this.year == i){
                        item.classList.add('selected');
                    }
                    item.innerText = i;
                    item.dataset.year = i;

                    item.addEventListener('click', ()=>{
                        this.selectHolder(this.yearSelector, item, item.dataset.year, this.month);
                    })

                    this.yearWrapper.append(item);
                }

                this.pickerBody = document.createElement('div');
                this.pickerBody.className = '_i_datetime-picker-body';
                this.picker.append(this.pickerBody);

                this.pickerLegend = document.createElement('div');
                this.pickerLegend.className = 'row m_legend';
                this.pickerBody.append(this.pickerLegend);

                for (let i = 0; i < this.days.length; i++) {
                    let item = document.createElement('div');
                    item.className = 'row-item';
                    item.innerText = this.days[i];
                    this.pickerLegend.append(item);
                }

                this.pickerMonthPage = document.createElement('div');
                this.pickerMonthPage.className = 'month-page';
                this.pickerBody.append(this.pickerMonthPage);

                // footer
                    this.footer = document.createElement('div');
                    this.footer.className = '_i_datetime-picker-footer';
                    this.picker.append(this.footer);

                    this.clearBtn = document.createElement('div');
                    this.clearBtn.className = '_i_datetime-picker-footer-btn';
                    this.clearBtn.innerText = 'clear';

                    this.clearBtn.addEventListener('click', ()=>{
                        this.clearValue();
                    })

                    this.setTodayBtn = document.createElement('div');
                    this.setTodayBtn.className = '_i_datetime-picker-footer-btn';
                    this.setTodayBtn.innerText = 'today';

                    this.setTodayBtn.addEventListener('click', ()=>{
                        let date = new Date();
                        this.day = date.getDate();
                        this.generatePickerBody(date);
                        this.setValue(date);
                    })

                    this.footer.append(this.clearBtn, this.setTodayBtn);

                // END footer

            // END picker

        // end DOM generating

        this.inputBtn.addEventListener('click', e => {
            let now = new Date(this.year, this.month, this.day, this.hour, this.month);
            this.generatePickerBody(now);
        })

    }

    pickerCloser(e){
        if(e.type == 'focus' || (e.target.closest(`#${this.home.id}`)==null && !e.target.dataset.pickerDay)){
            this.picker.classList.remove('opened');
            this.monthSelector.classList.remove('opened');
            this.yearSelector.classList.remove('opened');
            document.documentElement.removeEventListener('click', this.pickerCloser);
        }
    }

    inputHolder(input,e){

        if(input.value.match(/\D/)){
            input.value = input.value.replace(/\D/g, '');
        }

        if(e.type=='keydown'){

            let val = +(input.value ? input.value : input.dataset.value);

            if(e.code=="ArrowUp"){
                e.preventDefault();

                if(val == 0 && (input.dataset.type!='hour' && input.dataset.type!='min')){
                    input.value = input.dataset.min;
                } else {
                    if(input.value == ''){
                        val = input.dataset.type == 'month' ? +input.dataset.value : +input.dataset.value - 1;
                    }
                    input.value = (val + 1) > input.dataset.max ? input.dataset.min : (val + 1);
                }

            } else if(e.code=="ArrowDown"){
                e.preventDefault();
                if(input.value == ''){
                    val = input.dataset.type == 'month' ? +input.dataset.value+2 : +input.dataset.value + 1;
                }
                input.value = (val - 1) < input.dataset.min ? input.dataset.max : (val - 1);
            }
        }

        if(input.value){

            let checkVal = input.value * 1;


            if(!this.isMobile){
                if(String(checkVal).length<input.size){

                    let addZero = '';
                    for(let i = 0; i<(input.size - String(checkVal).length); i++){
                        addZero += '0'
                    }
                    input.value = addZero + checkVal;

                } else if(String(checkVal).length>=input.size){
                    input.value = input.value.replace(/^0/, '');
                }
            }

            if(+input.value>input.dataset.max){
                input.value = input.dataset.max;
            }

            if(input.dataset.type=='hour' || input.dataset.type=='min'){

                input.dataset.value = +input.value;
                this[input.dataset.type] = input.dataset.value;

            } else if(+input.value>0){

                if(input.dataset.type == 'month'){
                    input.dataset.value = +input.value - 1;
                } else {
                    input.dataset.value = +input.value;
                }

                this[input.dataset.type] = +input.dataset.value;

                // need to check the correctness of the date
                if(input.dataset.type=='month' || input.dataset.type=='year'){
                    let lastDayOfMonth = (new Date(this.year, +this.month + 1, 0)).getDate();

                    if(+this.inputDay.value > lastDayOfMonth){
                        this.inputDay.value = lastDayOfMonth;
                        this.inputDay.dataset.value = lastDayOfMonth;
                        this.day = lastDayOfMonth;
                    }
                }

            }

            let setDate = new Date(this.year,this.month,this.day,this.hour,this.min);
            this.setValue(setDate, 'onlyHomeData');


        }

    }


    selectHolder(select, item, year, month){
        let selected = select.querySelector('.selected');

        if(select.classList.contains('opened')){

            selected.classList.remove('selected');
            item.classList.add('selected');
            select.classList.remove('opened');
            let date = new Date(year, month);
            this.generatePickerBody(date, true);

        } else {

            if(select.offsetParent.querySelector('.opened')){
                select.offsetParent.querySelector('.opened').classList.remove('opened');
            }

            select.classList.add('opened');
            selected.scrollIntoView({ block: "center", inline: "center" });
        }

    }

    generatePickerBody(date, setValue) {

        this.closeSelectors();

        let year = date.getFullYear();
        let month = date.getMonth();
        // let currentDay = this.day;

        this.month  = month;
        this.year   = year;

        let firstDayOfMonth = new Date(year, month, 1);
        let lastDayOfMonth = new Date(year, month + 1, 0);

        let lastDayOfPrevMonth = new Date(year, month, 0);
        let firstDayOfNextMonth = new Date(year, month + 1, 1);

        let dayCounter = 1;

        //  monday is the firstDay
        let monthStart = firstDayOfMonth.getDay() == 0 ? 7 : firstDayOfMonth.getDay();

        // generate MonthPage
        this.pickerMonthPage.innerHTML = ''; // clear DOM before appending children

        if(this.day>lastDayOfMonth.getDate()){
            this.day = lastDayOfMonth.getDate();
        }

        // need matrix 6rows * 7cols
        for (let rowNum = 1; rowNum <= 6; rowNum++) {
            let row = document.createElement('div');
            row.className = 'row';
            this.pickerMonthPage.append(row);

            for (let colNum = 1; colNum <= 7; colNum++) {
                let item = document.createElement('div');
                item.className = 'row-item';

                let dataDay;
                let dataMonth;
                let dataYear;

                if (rowNum == 1 && monthStart > colNum) {

                    item.classList.add('prev');

                    dataDay = lastDayOfPrevMonth.getDate() - (monthStart - (colNum + 1));
                    dataMonth = lastDayOfPrevMonth.getMonth();
                    dataYear = lastDayOfPrevMonth.getFullYear();

                } else {
                    if (dayCounter > lastDayOfMonth.getDate()) {

                        item.classList.add('next');

                        dataDay = dayCounter - lastDayOfMonth.getDate();
                        dataMonth = firstDayOfNextMonth.getMonth();
                        dataYear = firstDayOfNextMonth.getFullYear();

                    } else {

                        dataDay = dayCounter;
                        dataMonth = month;
                        dataYear = year;

                        if (dataDay == this.day) {
                            item.classList.add('selected');
                        }

                    }
                    dayCounter++;
                }

                item.innerText = dataDay;
                item.dataset.pickerDay = true;
                item.dataset.day = dataDay;
                item.dataset.month = dataMonth;
                item.dataset.year = dataYear;

                row.append(item);

                item.addEventListener('click', () => {

                    let date = new Date(item.dataset.year, item.dataset.month, item.dataset.day);
                    this.day = item.dataset.day;
                    this.generatePickerBody(date, true);

                })
            }
        }

        this.checkSelectors();

        if(!this.picker.classList.contains('opened')){
            this.picker.classList.add('opened');

            if(this.picker.getBoundingClientRect().bottom>document.documentElement.clientHeight){
                this.picker.classList.add('m_opentoup');
            } else if(this.picker.getBoundingClientRect().top<0) {
                this.picker.classList.remove('m_opentoup');
            }

            document.documentElement.addEventListener('click', this.pickerCloser.bind(this));
        }

        if(setValue){
            this.setValue(new Date(this.year,this.month,this.day,this.hour,this.min));
        }

    }

    checkSelectors(){
        let checkMonth = this.monthSelector.querySelector('.selected');
        if(checkMonth.dataset.month != this.month){
            checkMonth.classList.remove('selected');
            let correctMonth = this.monthSelector.querySelector(`.item[data-month="${this.month}"]`);
            if(correctMonth){
                correctMonth.classList.add('selected');
            }
        }

        // checking for existence
        if(!this.yearSelector.querySelector(`.item[data-year="${this.year}"]`)){
            let item = document.createElement('div');
            item.className = 'item';
            item.innerText = this.year;
            item.dataset.year = this.year;

            item.addEventListener('click', ()=>{
                this.selectHolder(this.yearSelector, item, item.dataset.year, this.month);
            })

            let stopFlag = false;
            this.yearWrapper.childNodes.forEach((el,i)=>{
                if(!stopFlag){
                    if(el.dataset.year>this.year){
                        this.yearWrapper.insertBefore(item, el);
                        stopFlag = true;
                    } else if(i==(this.yearWrapper.childNodes.length - 1)){
                        this.yearWrapper.append(item);
                        stopFlag = true;
                    }
                }
            })
        }

        let checkYear = this.yearSelector.querySelector('.selected');
        if(checkYear.dataset.year != this.year){
            checkYear.classList.remove('selected');
            let correctYear = this.yearSelector.querySelector(`.item[data-year="${this.year}"]`);
            if(correctYear){
                correctYear.classList.add('selected');
            }
        }
    }

    closeSelectors(){
        if(this.yearSelector.classList.contains('opened')){
            this.yearSelector.classList.remove('opened');
        }
        if(this.monthSelector.classList.contains('opened')){
            this.monthSelector.classList.remove('opened');
        }
    }

    setValue(timestamp,onlyHomeData){

        let date = new Date(timestamp);

        if(date == 'Invalid Date') {
            throw new Error('IDateTime accepted incorrect time format');
        }

        this.home.dataset.value = +date; // set value == milliseconds

        let day = this.day = date.getDate();
        let month = this.month = date.getMonth();
        let year = this.year = date.getFullYear();
        let hour = this.hour = date.getHours();
        let min  = this.min = date.getMinutes();

        // .dataset.value - technical information
        this.inputDay.dataset.value = day;
        this.inputMonth.dataset.value = month;
        this.inputYear.dataset.value = year;

        if(this.needHoursFlag){
            this.inputHour.dataset.value = hour;
            this.inputMin.dataset.value = min;
        }

        ++month; // correcting month

        if(onlyHomeData) {

            // set placeholder for visual hint
                this.inputDay.placeholder = day.toString().length < 2 ? `0${day}` : day;

                this.inputMonth.placeholder = month.toString().length < 2 ? `0${month}` : month;
                this.inputYear.placeholder = year;

                if(this.needHoursFlag){
                    this.inputHour.placeholder = hour.toString().length < 2 ? `0${hour}` : hour;
                    this.inputMin.placeholder = min.toString().length < 2 ? `0${min}` : min;
                }

            return;
        }

        // .value - visual information !== dataset.value
            this.inputDay.value = day.toString().length < 2 ? `0${day}` : day;

            this.inputMonth.value = month.toString().length < 2 ? `0${month}` : month;
            this.inputYear.value = year.toString().length < 2 ? `0${year}` : year;

            if(this.needHoursFlag){
                this.inputHour.value = hour.toString().length < 2 ? `0${hour}` : hour;
                this.inputMin.value = min.toString().length < 2 ? `0${min}` : min;
            }

    }

    clearValue(){
        this.home.dataset.value = null;
        this.picker.classList.remove('opened');

        let dateNow = new Date();
        this.day    = dateNow.getDate();
        this.month  = dateNow.getMonth();
        this.year   = dateNow.getFullYear();
        this.hour   = dateNow.getHours();
        this.min    = dateNow.getMinutes();

        this.input.querySelectorAll('input').forEach(el=>{
            el.value = '';
            el.dataset.value = '';
        })

        this.inputDay.placeholder = 'dd';
        this.inputMonth.placeholder = 'mm';
        this.inputYear.placeholder = 'yyyy';

        if(this.needHoursFlag){
            this.inputHour.placeholder = 'hh';
            this.inputMin.placeholder = 'mm';
        }
    }

    getValue(){
        return +this.home.dataset.value;
    }

}