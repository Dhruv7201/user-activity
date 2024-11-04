from .LoginAPIs.api_login import api_login
from .AppsAPIs.api_datatable import api_datatable
from .AppsAPIs.api_userList import api_userList
from .EmployeeAPIs.api_employeelist import api_employeelist
from .EmployeeAPIs.api_employeedetails import api_employeedetails
from .EmployeeAPIs.api_applistofemployee import api_applistofemployee
from .SettingsAPIs.api_groupapp import api_groupapp
from .SettingsAPIs.api_unproductive import api_unproductive
from .ScreenShotAPIs.api_fileupload import api_file_upload
from .ScreenShotAPIs.api_readfile import api_readfile
from .ProductivityAPIs.api_productivity import api_productivity
from .ProductivityAPIs.api_topapp import api_topapp
from .ProductivityAPIs.api_productivitypie import api_productivitypie
from .DashBoardAPIs.api_AttendanceChart import api_attendance_chart
from .DashBoardAPIs.api_UserRanking import api_userRankings
from .AttendancePageAPIs.attendancePercentage import api_attendancePercentage
from .AttendancePageAPIs.totalTime import api_totalTime
from .SettingsAPIs.api_users import api_users
from .SettingsAPIs.api_teams import api_teams
from .ReportPageAPIs.api_dailyreport import api_dailyreport
from .ReportPageAPIs.api_monthlyreport import api_monthlyreport
from .ReportPageAPIs.api_appBar import api_appBar
from .ExeConfig.config import api_config
from .ExeConfig.updater import api_update


def register_api(app):
    app.include_router(api_employeedetails, prefix="/api")
    app.include_router(api_applistofemployee, prefix="/api")
    app.include_router(api_attendancePercentage, prefix="/api")
    app.include_router(api_totalTime, prefix="/api")
    app.include_router(api_productivity, prefix="/api")
    app.include_router(api_topapp, prefix="/api")
    app.include_router(api_productivitypie, prefix="/api")
    app.include_router(api_login, prefix="/api")
    app.include_router(api_attendance_chart, prefix="/api")
    app.include_router(api_userRankings, prefix="/api")
    app.include_router(api_file_upload, prefix="/api")
    app.include_router(api_readfile, prefix="/api")
    app.include_router(api_datatable, prefix="/api")
    app.include_router(api_userList, prefix="/api")
    app.include_router(api_employeelist, prefix="/api")
    app.include_router(api_groupapp, prefix="/api")
    app.include_router(api_unproductive, prefix="/api")
    app.include_router(api_users, prefix="/api")
    app.include_router(api_dailyreport, prefix="/api")
    app.include_router(api_monthlyreport, prefix="/api")
    app.include_router(api_appBar, prefix="/api")
    app.include_router(api_teams, prefix="/api")
    app.include_router(api_config, prefix="/api")
    app.include_router(api_update, prefix="/api")
