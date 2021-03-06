var calendarUpdateCounter = 1;
var imageUpdateCounter = 1;

function startTime() {
    var today = new Date();
    var h = today.getHours().toString().padStart(2, "0");
    var m = today.getMinutes().toString().padStart(2, "0");
    var s = today.getSeconds().toString().padStart(2, "0");
    $(".clock").html(h + ":" + m + "<span class='sec'>" + s + "</span>");
    var t = setTimeout(startTime, 500);
}

function startMainLoop() {
    MainLoop();
}

function MainLoop() {

    calendarUpdateCounter--;

    if (calendarUpdateCounter <= 0) {
        console.log('update calendar');
        updateCalendar();
        calendarUpdateCounter = 300;
    }

    imageUpdateCounter--;

    if (imageUpdateCounter <= 0) {
        console.log('update image');
        updateImage();
        imageUpdateCounter = 90;
    }

    putStatus(`next image update ${imageUpdateCounter}s - next calendar update ${calendarUpdateCounter}s`);

    var t = setTimeout(MainLoop, 1000);
}

function putMessage(message) {
    $("#message").html(message);
}

function putStatus(status) {
    $("#status").html(status);
}

// --------------------------------------------------------------------------------
// update calendar

let monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
let weekDayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function updateCalendar() {
    $.ajax({
        type: "get",
        url: "/api/calendar",
        context: document.body,
        success: function(data) {
            console.log(data);
            if (data) {
                renderCalendar(data);
            }
        }
    });
}

function ISO8601_week_no(dt) {
    var tdt = new Date(dt.valueOf());
    var dayn = (dt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function ISO8601_date(dt) {
    return dt.getFullYear().toString() + "-" +
        (dt.getMonth() + 1).toString().padStart(2, "0") + "-" +
        dt.getDate().toString().padStart(2, "0");
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function currentDate() {
    let current = new Date();
    current.setHours(0, 0, 0, 0)
    return current;
}

function renderCalendar(events) {
    putMessage("calendar refresh");

    // find first day of week
    let current = currentDate();

    let wd = current.getDay();
    let firstDate = currentDate();
    // flip week on Sunday
    if (wd === 0) {
        firstDate = addDays(firstDate, -1);
        wd = firstDate.getDay();
    }
    // find Monday
    while (wd > 1) {
        firstDate = addDays(firstDate, -1);
        wd = firstDate.getDay();
    }

    // fill calendar
    let iDate = currentDate();
    $("#calendar").empty();

    for (w = 0; w < 3; w++)
        for (wd = 0; wd < 7; wd++) {
            let i = (w * 7) + wd;
            let iDate = addDays(firstDate, i);
            let isToday = ISO8601_date(iDate) === ISO8601_date(current);

            // handle week number
            if (wd === 0) {
                let weekNoDiv = $("<div/>");
                let weekNoTitle = "<br/><span class='weekofyear'>" + ISO8601_week_no(iDate).toString().padStart(2, "0") + "</span>";
                weekNoDiv.addClass("week_title").html(weekNoTitle);
                $("#calendar").append(weekNoDiv);
            }

            // reset cell
            let dayCell = $("<div/>");
            dayCell.attr("id", "day" + i).addClass("day");
            // month name on first element or first of month
            let monthTitle = "";
            if (i === 0 || iDate.getDate() == 1) {
                monthTitle = monthNames[iDate.getMonth()];
            }
            // day of week and month in each header
            let dayTitle = "<span class='monthofyear'>" + monthTitle + "</span><br/>" +
                "<span class='dayofweek'>" + weekDayNames[wd] + "</span>&nbsp;" +
                "<span class='dayofmonth'>" + iDate.getDate().toString().padStart(2, "0") + "</span>";

            dayCell.html("<div id='dayHeader'><div class='day_title'>" + dayTitle + "</div></div><div id='dayContent'></div>");
            dayCell.removeClass("today").removeClass("monthfirst").addClass("day");
            $("#calendar").append(dayCell);

            // build cell content
            let content = "";

            let iDateFormatted = ISO8601_date(iDate);

            // render all day events always on top
            events.forEach((entry) => {
                if (iDateFormatted === entry.date && entry.allDayEvent) {
                    if (entry.publicHoliday) {
                        content += "<div class='public_holiday_day'>" + entry.description + "</div>";
                    } else if (entry.schoolHoliday) {
                        content += "<div class='school_holiday_day'>" + entry.description + "</div>";
                    } else {
                        let addClass = (entry.isPrimary ? " primary_calendar" : "") + (entry.isSecondary ? " secondary_calendar" : "");
                        content += "<div class='all_day" + addClass + "'>" + entry.description + "</div>";
                    }
                }
            });

            // render timed events below
            events.forEach((entry) => {
                if (iDateFormatted === entry.date && !entry.allDayEvent) {
                    let addClass = (entry.isPrimary ? " primary_calendar" : "") + (entry.isSecondary ? " secondary_calendar" : "");
                    content += "<p class='single_event" + addClass + "'>" + entry.time + " " + entry.description + "</p>";
                }
            });

            $("#day" + i + " > #dayContent").html(content);

            if (isToday) {
                $("#day" + i).toggleClass("today");
            }
        }

    putMessage("");
}

// --------------------------------------------------------------------------------
// update image

function updateImage() {
    $.ajax({
        type: "get",
        url: "/api/image",
        context: document.body,
        success: function(data) {
            renderImage(data);
        }
    });

}

function renderImage(imageObj) {
    putMessage("updating image");

    $("<img/>").attr("src", imageObj.src).on("load", function() {
        $(this).remove(), $(".imageContainer").css({
            background: "#000 url(" + imageObj.src + ") center center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat"
        });
        $(".imageCreated").html(imageObj.label);
    });

    putMessage("");
}