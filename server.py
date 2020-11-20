# -*- coding: utf-8 -*-

import tornado.ioloop
import tornado.web

import os
import web 
import dbconn  
dbconn.register_dsn("host=localhost dbname=datebase user=llms password=pass")

from handlers import *

settings = {
    "static_path": os.path.join('pages'),
    "debug": True
}


application = tornado.web.Application([
    (r'/',HeadHandler),#登录页面
    (r'/login',LoginHandler),#登录
    (r'/Error',ErrorHandler),#密码登录错误提示

    (r'/Administrator',AdministratorHandler),#管理员登陆后主页面
    (r"/Studentpage/([0-9]+)?",StudentpageHandler),#学生登陆主后页面
    (r"/Teacherpage/([0-9]+)?",TeacherpageHandler),#教师登陆后页面
    (r"/tmission/([0-9]+)?",TmissionRestHandler),#管理员登陆后教师任务
    (r"/plan/([0-9]+)?",PlanRestHandler),
    (r"/teacher/([0-9]+)?",TeacherRestHandler),



    (r"/course/([0-9]+)?",CourseRestHandler),#管理员登陆后学生清单
    (r"/student/([0-9]+)?",StudentRestHandler),#管理员登陆后学生清单
    (r"/major/([0-9]+)?",MajorRestHandler),#管理员登陆后学生清单
    (r"/grade/([0-9]+)?",GradeRestHandler),#管理员登陆后学生清单
    (r'/teacher/([0-9]+)?',TeacherRestHandler),#管理员登陆后教师信息

    (r"/s_grade/([0-9]+)?",S_GradeRestHandler),#学生界面——成绩表
    (r"/s_plan/([0-9]+)?",S_PlanRestHandler),#学生界面——培养计划
    (r"/s_coursetable/([0-9]+)?",S_CoursetableRestHandler),#学生界面——课程表
    (r'/zclasstable',ZclasstableHandler),#学生界面——课程表(转置)

    (r"/t_mission/([0-9]+)?",T_MissionRestHandler),#教师界面——教学任务
    (r"/t_student/([0-9]+)?",T_StudentRestHandler),#教师界面——学生名单
    (r"/t_grade/([0-9]+)?",T_GradeRestHandler),#教师界面——学生成绩

    (r'/([^z]*)', web.HtplHandler)
], **settings)



if __name__ == "__main__":
    application.listen(8888)
    server = tornado.ioloop.IOLoop.instance()
    server.start()

