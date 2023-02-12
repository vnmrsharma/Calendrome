const fs = require('fs')

class DayParser {

    constructor()
    {
        this.freeArray = new Array(24*2).fill(true); //freeArray is true if that interval of time is still open
    }
    //get from time to index in the array
    //00:00:00 - hour, minute, millisecond
    setClose(begin, end)
    {
        console.log(`${begin}-${end}`)
        var lower = this.convertFromTime(begin);
        var upper = this.convertFromTime(end);
        console.log(`${lower}-${upper}`);
        for(var i = lower; i <= upper; i++)
            this.freeArray[i] = false;
    }

    isFree(time)
    {
        return this.freeArray[this.convertFromTime(time)];
    }

    //get from time to index in the array
    //00:00:00 - hour, minute, millisecond
    convertFromTime(time)
    {
        var x = parseInt(time.substring(0,2));
        var y = Math.floor(parseInt(time.substring(3,5))/30);
       
        return 2*x + y;
    }
    
}


class MonthParser {

    constructor(month, year) {
        this.dayArray = new Array(31);
        for(var i =0; i < 31; i++)
            this.dayArray[i] = new DayParser();
      this.month = month;
      this.year = year;
    }

  
    addData(filename)
    {
        try{
            const jsonString = fs.readFileSync(filename,'utf-8');
            //console.log(jsonString);
            const obj = JSON.parse(jsonString);
            const array = obj.table;
            //console.log(array);
            for(var i =0; i < array.length; i++)
            {    
                //EDGE CASE: DO NOT HAVE AN EVENT LOOPING OVER MULTIPLE DAYS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                //month , day, year
                var day = array[i].start_day;
                var day_attribs = day.split("/");
              
                if(parseInt(day_attribs[0]) != parseInt(this.month))
                {
                    continue;
                }

                if((parseInt(day_attribs[2]) !== parseInt(this.year)))
                {
                  continue;
                }

                if(parseInt(day_attribs[1]) === 23 && parseInt(day_attribs[2]) === 2023)
                {
                    //console.log(array[i]);
                    //this.dayArray[parseInt(day_attribs[1]) - 1].setClose(array[i].start_time, array[i].end_time);
                    //console.log("HELLO");
                }
                console.log(`Day: ${parseInt(day_attribs[1]) - 1} - ${array[i].start_time} - ${array[i].end_time} `);
                this.dayArray[parseInt(day_attribs[1]) - 1].setClose(array[i].start_time, array[i].end_time);

                //this.dayArray[parseInt(day_attribs[1]) - 1].setClose(array[i].start_time, array[i].end_time);
                    
            }
              }
              catch(err)
              {
                  console.log(err);
              }
    }

    //day starts at 1
    isFree(day, time)
    {
        return this.dayArray[day-1].isFree(time);
    }

    //days starts at 1
    getFreeArray(day)
    {
        return this.dayArray[day-1].freeArray;
    }

  }

  var a = new MonthParser(2,2023);
  a.addData('./myjsonfile.json');
  console.log(a.isFree(23,`18:00:00`));
  console.log(a.getFreeArray(23));
 