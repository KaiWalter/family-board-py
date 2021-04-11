import logging
import random
from datetime import date, timedelta

import dateutil.parser
from injector import inject

from german_holidays import GermanPublicHolidays, GermanSchoolHolidays
from microsoft_graph import MicrosoftGraphImages, MicrosoftGraphCalendar
from google_api import GoogleCalendar


class Board:

    @inject
    def __init__(self, graph_calendar: MicrosoftGraphCalendar, graph_images: MicrosoftGraphImages, google_calendar: GoogleCalendar, public_holidays: GermanPublicHolidays, school_holidays: GermanSchoolHolidays):

        self.graph_calendar = graph_calendar
        self.graph_images = graph_images
        self.google_calendar = google_calendar
        self.public_holidays = public_holidays
        self.school_holidays = school_holidays
        self.calendar_weeks = 3

    def __get_start_end_date(self):
        date_format = "%Y-%m-%d"
        today = date.today()
        start = today - timedelta(days=today.weekday())
        start_date = start.strftime(date_format)
        end = start + timedelta(days=(self.calendar_weeks*7)-1)
        end_date = end.strftime(date_format)
        return start, start_date, end, end_date

    def next_image(self):
        images_response = self.__query_images()
        download_url = None
        image_created = None

        if 'value' in images_response:
            images = images_response['value']

            selected_image_index = random.randint(0, len(images))

            selected_image = images[selected_image_index]
            download_url = selected_image['@microsoft.graph.downloadUrl']
            image_created = ""

            if 'photo' in selected_image:
                photo = selected_image['photo']
                if 'takenDateTime' in photo:
                    image_created = dateutil.parser.isoparse(
                        photo['takenDateTime']).strftime('%b %Y')

        return {'src':download_url, 'label':image_created}

    def __query_images(self):
        return self.graph_images.query_images()

    def query_calendar(self):
        results = []

        _, start_date, _, end_date = self.__get_start_end_date()

        try:
            results.extend(self.school_holidays.query(
                start=start_date, end=end_date))
        except Exception as Argument:
            logging.exception("school_holidays")

        try:
            results.extend(self.public_holidays.query(
                start=start_date, end=end_date))
        except Exception as Argument:
            logging.exception("public_holidays")

        try:
            results.extend(self.graph_calendar.query_calendar(
                start=start_date, end=end_date))
        except Exception as Argument:
            logging.exception("graph_calendar")

        try:
            results.extend(self.google_calendar.query_calendar(
                start=start_date, end=end_date))
        except Exception as Argument:
            logging.exception("google_calendar")

        return results

