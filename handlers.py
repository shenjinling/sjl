# -*- coding: utf-8 -*-
import tornado.ioloop
import tornado.web
import web
import re
#----------------------------------------登录界面------------------------------------------------------
class HeadHandler(web.HtplHandler):
              
    def post(self):

        username = self.get_argument("username")
        password = self.get_argument("password")

        if  not username or not password :
            self.redirect("/error")
            return
            
        username = str(username)
        password = str(password)


        self.set_cookie("username_cookie", username)
        self.set_cookie("password_cookie", password)
        self.redirect("/login")

class LoginHandler(web.BaseHandler):
    
    def get(self):
        def flatten(nested):
            for sublist in nested:
                for element in sublist:
                    yield element

        username = self.get_cookie("username_cookie")
        password = self.get_cookie("password_cookie")
        if not username or not password:
            self.redirect("/error")
   
        username = int(username)
        password = int(password)

        if username == 100001:
            if password == 100001:
                self.redirect("/administrator")
                return
            else :
                self.redirect("/error")
                return
        
        with self.db_cursor() as dc:
            sql1 = '''
            SELECT sno FROM student
            '''
            dc.execute(sql1)
            items1 = dc.fetchall()
            list1 = []
   
            for item in flatten(items1):
                list1.append(item)
        
        with self.db_cursor() as dc:

            sql2 = '''
            SELECT tno FROM teacher
            '''
            dc.execute(sql2)
            items2 = dc.fetchall()
            list2 = []

            for item in flatten(items2):
                list2.append(item)

        if username in list1:
            if username == password:
                self.redirect("/studentpage")                    
            else:
                self.redirect("/error")                    
        elif username in list2:
            if username == password:
                self.redirect("/teacherpage")                    
            else:
                self.redirect("/error")
        else:
            self.redirect("/error")


class ErrorHandler(web.HtplHandler):
    pass

#--------------------------------管理员-------------------------------------
class AdministratorHandler(web.HtplHandler):
    pass

class StudentRestHandler(web.RestHandler):
    def get(self,sno):
        with self.db_cursor() as dc:
            if sno:
                sno = int(sno)
                if sno<1000:
                    sql = '''
                    SELECT sno, sname, mname, ssex, stu_mno
                    FROM student INNER JOIN major ON  student.stu_mno= mno
                    WHERE stu_mno=%s
                    '''
                    dc.execute(sql,[sno])
                    self.write_json(dc.fetchall_dicts())
                else:
                    sql = '''
                    SELECT sno, sname, mname, ssex, stu_mno
                    FROM student INNER JOIN major ON  student.stu_mno= mno
                    WHERE sno=%s
                    '''
                    dc.execute(sql,[sno])
                    row = dc.fetchone_dict()
                    if row:
                        self.write_json(row)
                    else:
                        self.set_status(404)
            else:
                sql = '''
                SELECT sno, sname, mname, ssex, stu_mno
                FROM student INNER JOIN major ON  student.stu_mno= mno
                ORDER BY sno,mname
                '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())
            
    def post(self,sno):
        student = self.read_json()
        with self.db_cursor() as dc:
            sql = '''
            INSERT 
            INTO student (sno,sname,ssex,stu_mno)
            VALUES( %s, %s, %s, %s) RETURNING sno;
            '''
            dc.execute(sql, [student.get('sno'),
                student.get('sname'),student.get('ssex'),student.get('stu_mno')])
            sno = dc.fetchone()[0]
            student['sno']=sno
            self.write_json(student)


    def put(self, sno):
        student = self.read_json()
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE student SET 
                sno=%s,sname=%s, ssex=%s, stu_mno=%s
            WHERE sno=%s 
            '''
            dc.execute(sql, [student['sno'], 
                student['sname'], student['ssex'],student['stu_mno'],sno])
            dc.commit()
        self.write_json(student)


    def delete(self, sno):
        sno = int(sno)
        with self.db_cursor() as cur:
            sql = "DELETE FROM student WHERE sno= %s"
            cur.execute(sql, [sno])


class   MajorRestHandler(web.RestHandler):
    def get(self,mno):
        with self.db_cursor() as dc:
            if mno :
                mno = int(mno)
                sql = '''
                SELECT mno,mname
                FROM major
                WHERE mno=%s
                '''
                dc.execute(sql,[mno])
                row = dc.fetchone_dict()
                if row:
                    self.write_json(row)
                else:
                    self.set_status(404)
            else:
                sql = '''
                SELECT mno,mname
                FROM major
                ORDER BY mno
                '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())
            
    def post(self, mno):
        major = self.read_json()
        with self.db_cursor() as dc:
            sql = '''
            INSERT INTO major 
                (mno,mname)
                VALUES(%s, %s) RETURNING mno;
            '''
            dc.execute(sql, [major.get('mno'), major.get('mname')])
            mno = dc.fetchone()[0]
            major['mno']=mno
            self.write_json(major)


    def put(self, mno):
        major = self.read_json()
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE major SET 
                mno=%s,mname=%s
            WHERE mno=%s 
            '''
            dc.execute(sql, [major['mno'], major['mname'],mno])
            dc.commit()
        self.write_json(major)


    def delete(self, mno):
        mno = int(mno)
        with self.db_cursor() as cur:
            sql = "DELETE FROM major WHERE mno= %s"
            cur.execute(sql, [mno])

class CourseRestHandler(web.RestHandler):
    def get(self,cno):

        with self.db_cursor() as dc:
            if cno :
                cno = int(cno)
                sql = '''SELECT cno, cname, ccredit FROM course WHERE cno=%s'''
                dc.execute(sql,[cno])
                row = dc.fetchone_dict()
                if row:
                    self.write_json(row)
                else:
                    self.set_status(404)
            else:
                sql = '''SELECT cno, cname, ccredit FROM course ORDER BY cno '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())

    def post(self, cno):
        course = self.read_json()
        
        with self.db_cursor() as dc:
            sql = '''
            INSERT INTO course 
                (cno,cname,ccredit)
                VALUES( %s, %s, %s) RETURNING cno;
            '''
            dc.execute(sql, [course.get('cno'), 
                course.get('cname'),course.get('ccredit')])
            cno = dc.fetchone()[0]
            course['cno']=cno
            self.write_json(course)
    
    def put(self, cno):
        course = self.read_json()
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE course SET cno=%s,cname=%s,ccredit=%s
            WHERE cno=%s
            '''
            dc.execute(sql, [course['cno'],course['cname'], 
                course['ccredit'], cno])
            dc.commit()
            
        self.write_json(course)

    def delete(self,cno):
        cno = int(cno)
        with self.db_cursor() as cur:
            sql = "DELETE FROM course WHERE cno= %s"
            cur.execute(sql, [cno])


class   GradeRestHandler(web.RestHandler):
    def get(self,gn):
        with self.db_cursor() as dc:
            if gn:
                gn = int(gn)
                if gn<1000:
                    sql = '''
                    SELECT gn,g_cno, cname, g_sno, sname, grade
                    FROM student INNER JOIN (course INNER JOIN grade ON course.cno= grade.g_cno) ON grade.g_sno=student.sno 
                    WHERE g_cno=%s
                    '''
                    dc.execute(sql,[gn])
                    self.write_json(dc.fetchall_dicts())
                else:
                    sql = '''
                    SELECT gn,g_cno, cname, g_sno, sname, grade
                    FROM student INNER JOIN (course INNER JOIN grade ON course.cno= grade.g_cno) ON grade.g_sno=student.sno 
                    WHERE gn=%s
                    '''
                    dc.execute(sql,[gn])
                    row = dc.fetchone_dict()
                    if row:
                        self.write_json(row)
                    else:
                        self.set_status(404)

            else:
                sql = '''
                SELECT gn,g_cno, cname, g_sno, sname, grade
                FROM student INNER JOIN (course INNER JOIN grade ON course.cno= grade.g_cno) ON grade.g_sno=student.sno 
                ORDER BY g_cno,g_sno
                '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())

    def post(self, gn):
        grade = self.read_json()
        with self.db_cursor() as dc:
            sql = '''
            INSERT INTO grade 
                ( g_cno, g_sno, grade)
                VALUES(%s, %s, %s) RETURNING gn;
            '''
            dc.execute(sql, [grade.get('g_cno'), grade.get('g_sno'), grade.get('grade')])
            gn = dc.fetchone()[0]
            grade['gn']=gn
            self.write_json(grade)

    def put(self,gn):
        grade= self.read_json()
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE grade SET 
            gn=%s,g_cno=%s,g_sno=%s,grade=%s
            WHERE gn=%s 
            '''
            dc.execute(sql, [grade['gn'],grade['g_cno'],grade['g_sno'],grade['grade'],gn])
            dc.commit()
        self.write_json(grade)

    def delete(self,gn):
        gn = int(gn)
        with self.db_cursor() as cur:
            sql = "DELETE FROM grade WHERE gn=%s"
            cur.execute(sql, [gn])

class PlanRestHandler(web.RestHandler):
    def get(self,pn):
        with self.db_cursor() as dc:
            if pn :
                pn = int(pn)
                if pn<1000:
                    sql = '''
                    SELECT cno,mname, cname,pterm,p_cno,p_mno,pn
                    FROM major INNER JOIN (course INNER JOIN plan ON course.cno = plan.p_cno) ON major.mno = plan.p_mno
                    WHERE p_mno=%s
                    '''
                    dc.execute(sql,[pn])
                    self.write_json(dc.fetchall_dicts())
                else:
                    sql = '''
                    SELECT cno,mname, cname,pterm,p_cno,p_mno,pn
                    FROM major INNER JOIN (course INNER JOIN plan ON course.cno = plan.p_cno) ON major.mno = plan.p_mno
                    WHERE pn=%s
                    '''
                    dc.execute(sql,[pn])
                    row = dc.fetchone_dict()
                    if row:
                        self.write_json(row)
                    else:
                        self.set_status(404)
            else:
                sql = '''
                SELECT cno,mname, cname,pterm,p_cno,p_mno,pn
                FROM major INNER JOIN (course INNER JOIN plan ON course.cno = plan.p_cno) ON major.mno = plan.p_mno
                ORDER BY p_mno,pterm;
                '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())
                
                
    def post(self, pn):
        plan = self.read_json()
        p_cno=plan.get('p_cno')
        p_mno=plan.get('p_mno')
        pterm=plan.get('pterm')
        with self.db_cursor() as dc:
            sql = '''
            INSERT INTO plan 
                (p_mno,p_cno,pterm)
                VALUES(%s, %s, %s) RETURNING pn;
            '''
            dc.execute(sql, [p_mno,p_cno,pterm])
            pn = dc.fetchone()[0]
            plan['pn']=pn 
            self.write_json(plan)
    

    def put(self, pn):
        plan = self.read_json()
        
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE plan SET
                pn=%s,p_mno=%s,p_cno=%s, pterm=%s
                WHERE pn=%s
            '''
            dc.execute(sql, [plan['pn'],plan['p_mno'],plan['p_cno'], plan['pterm'], pn])
            dc.commit()

        self.write_json(plan)


    def delete(self, pn):
        pn = int(pn)
        with self.db_cursor() as cur:
            sql = "DELETE FROM plan WHERE pn= %s"
            cur.execute(sql, [pn])




class TeacherRestHandler(web.RestHandler):
    def get(self,tno):

        with self.db_cursor() as dc:
            if tno :
                tno = int(tno)

                sql = '''
                SELECT tno, tname, tsex, ttitle FROM teacher
                WHERE tno=%s
                '''
                dc.execute(sql,[tno])
                row = dc.fetchone_dict()
                if row:
                    self.write_json(row)
                else:
                    self.set_status(404)
            else:
                sql = '''
                SELECT tno, tname, tsex, ttitle FROM teacher
                ORDER BY tno
                '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())

    def post(self, tno):
        teacher = self.read_json()
        
        with self.db_cursor() as dc:
            sql = '''
            INSERT INTO teacher 
                (tno,tname,tsex,ttitle)
                VALUES( %s, %s, %s, %s) RETURNING tno;
            '''
            dc.execute(sql, [teacher.get('tno'), 
                teacher.get('tname'),teacher.get('tsex'),teacher.get('ttitle')])
            tno = dc.fetchone()[0]
            teacher['tno']=tno
            self.write_json(teacher)
    
    def put(self, tno):
        teacher = self.read_json()

        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE teacher SET tno=%s,tname=%s, tsex=%s ,ttitle=%s
            WHERE tno=%s
            '''
            dc.execute(sql, [teacher['tno'],teacher['tname'], 
                teacher['tsex'],teacher['ttitle'], tno])
            dc.commit()
            
        self.write_json(teacher)

    def delete(self,tno):
        tno = int(tno)
        with self.db_cursor() as cur:
            sql = "DELETE FROM teacher WHERE tno= %s"
            cur.execute(sql, [tno])




class TmissionRestHandler(web.RestHandler):
    def get(self,tmn):
        with self.db_cursor() as dc:
            if tmn :
                tmn = int(tmn)
                if tmn<1000:
                    sql = '''
                    SELECT cname, tname, tmtime,tmplace,tmweek,tm_cno,tm_tno,tmn
                    FROM course INNER JOIN (teacher INNER JOIN tmission ON teacher.tno=tmission.tm_tno) ON course.cno=tmission.tm_cno
                    WHERE tm_cno=%s
                    '''
                    dc.execute(sql,[tmn])
                    self.write_json(dc.fetchall_dicts())
                else:
                    sql = '''
                    SELECT cname, tname, tmtime,tmplace,tmweek,tm_cno,tm_tno,tmn
                    FROM course INNER JOIN (teacher INNER JOIN tmission ON teacher.tno=tmission.tm_tno) ON course.cno=tmission.tm_cno
                    WHERE tmn=%s
                    '''
                    dc.execute(sql,[tmn])
                    row = dc.fetchone_dict()
                    if row:
                        self.write_json(row)
                    else:
                        self.set_status(404)
            else:
                sql = '''
                SELECT cname, tname, tmtime,tmplace,tmweek,tm_tno,tm_cno,tmn
                FROM course INNER JOIN (teacher INNER JOIN tmission ON teacher.tno=tmission.tm_tno) ON course.cno=tmission.tm_cno
                ORDER BY tm_cno
                '''
                dc.execute(sql)
                self.write_json(dc.fetchall_dicts())


    def post(self, tmn):
        tmission = self.read_json()
        with self.db_cursor() as dc:
            sql = '''
            INSERT INTO tmission 
            (tm_cno,tm_tno,tmtime,tmplace,tmweek)
            VALUES( %s, %s, %s, %s,%s) RETURNING tmn;
            '''
            dc.execute(sql, [tmission.get('tm_cno'), 
            tmission.get('tm_tno'),tmission.get('tmtime'),tmission.get('tmplace'),tmission.get('tmweek')])
            tmn = dc.fetchone()[0]
            tmission['tmn']=tmn
            self.write_json(tmission)

    def put(self, tmn):
        tmission = self.read_json()
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE tmission SET 
                tm_tno=%s,tm_cno=%s,tmtime=%s,tmplace=%s,tmweek=%s
            WHERE tmn=%s 
            '''
            dc.execute(sql, [tmission['tm_tno'], 
                tmission['tm_cno'], tmission['tmtime'],tmission['tmplace'],tmission['tmweek'],tmn])
            dc.commit()
        self.write_json(tmission)


    def delete(self, tmn):
        tmn = int(tmn)
        with self.db_cursor() as cur:
            sql = "DELETE FROM tmission WHERE tmn= %s"
            cur.execute(sql, [tmn])


#----------------------------------------学生界面------------------------------------------------------
class StudentpageHandler(web.HtplHandler):
    pass
class S_GradeRestHandler(web.RestHandler):
    def get(self,g_sno):
        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            username = str(username)
        st_sno = username
        with self.db_cursor() as dc:
            if g_sno :
                g_sno = int(g_sno)
                sql = '''
                SELECT sno,cname, grade, ccredit
                FROM student INNER JOIN (course INNER JOIN grade ON course.cno = grade.g_cno) ON student.sno= grade.g_sno
                WHERE sno=%s
                '''
                dc.execute(sql,[g_sno])
                row = dc.fetchone_dict()
                if row:
                    self.write_json(row)
                else:
                    self.set_status(404)
            else:
                sql = '''
                SELECT sno,cname, grade, ccredit
                FROM student INNER JOIN (course INNER JOIN grade ON course.cno = grade.g_cno) ON student.sno= grade.g_sno
                WHERE sno=%s
                ORDER BY cname
                '''
                dc.execute(sql,[int(st_sno)])
                self.write_json(dc.fetchall_dicts())


class S_PlanRestHandler(web.RestHandler):
    def get(self,sno):
        
        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            username = str(username)

        st_sno = username
        
        with self.db_cursor() as dc:
            if sno :
                sno = int(sno)
                sql = '''
                SELECT sno, mname, cname, pterm, ccredit
                FROM (major INNER JOIN student ON major.mno = student.stu_mno) INNER JOIN (course INNER JOIN plan ON course.cno = plan.p_cno) ON major.mno = plan.p_mno
                WHERE sno=%s;
                '''
                dc.execute(sql,[sno])
                row = dc.fetchone_dict()
                if row:
                    self.write_json(row)
                else:
                    self.set_status(404)
            else:
                sql = '''
                SELECT sno, mname, cname, pterm, ccredit
                FROM (major INNER JOIN student ON major.mno = student.stu_mno) INNER JOIN (course INNER JOIN plan ON course.cno = plan.p_cno) ON major.mno = plan.p_mno
                WHERE sno=%s
                ORDER BY pterm
                '''
                dc.execute(sql,[int(st_sno)])
                self.write_json(dc.fetchall_dicts())

class S_CoursetableRestHandler(web.RestHandler):

    def get(self,sno):

        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            username = str(username)

        st_sno = username

        with self.db_cursor() as dc:
            if sno :
                sno = int(sno)
                sql = '''
                SELECT sno, cname, tname, tmtime,tmplace, tmweek, pterm
                FROM ((course INNER JOIN plan ON course.cno = plan.p_cno) INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                WHERE sno=%s;
        
            '''
                dc.execute(sql,[sno])
                row = dc.fetchone_dict()
                if row:
                    self.write_json(row)
                else:
                    self.set_status(404)
            else:
                sql = '''
                SELECT sno, cname, tname, tmtime,tmplace, tmweek, pterm
                FROM ((course INNER JOIN plan ON course.cno = plan.p_cno) INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                WHERE sno=%s
                ORDER BY pterm;
                '''
                dc.execute(sql,[int(st_sno)])
                self.write_json(dc.fetchall_dicts())


class ZclasstableHandler(web.RestHandler):

    def post(self):
        pterm = self.get_argument("pterm")
        if not pterm:
            self.redirect("/s_coursetable")
        pterm = str(pterm) 
        self.set_cookie("pterm_cookie",pterm)


    def get(self):
        pterm = self.get_cookie("pterm_cookie")
        
        if not pterm:
            self.redirect("/s_coursetable")
        else:
            self.clear_cookie("pterm_cookie")


        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            st_sno = username

        self.set_header("Content-Type", "text/html; charset=UTF-8")
        with self.db_cursor() as dc:
            sql = '''
            SELECT sno, cname, tname, tmtime,tmplace, tmweek, pterm
            FROM ((course INNER JOIN plan ON course.cno = plan.p_cno) INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
            WHERE sno=%s
            ORDER BY pterm;
            '''
            dc.execute(sql,[int(st_sno)])
            items = dc.fetchall()

        lists = []
        for i in range(5):
            lists.append([])
            for j in range(9):
                lists[i].append('')

        lists[0][0] = "第一大节"
        lists[1][0] = "第二大节"
        lists[2][0] = "第三大节"
        lists[3][0] = "第四大节"
        lists[4][0] = "第五大节"



        n = len(items)
        for i in range(0, n):
            row = items[i]
            term = row[6]
            if term == pterm:
                times = row[3]
                m = re.match(r".(\d).(\d)", times)
                lie = m.group(1)
                hang = m.group(2)
                lie = int(lie) 
                hang = int(hang) -1
                td = list(row)
                qi = td.pop(0)
                qi = td.pop(2)
                qi = td.pop(4)
                td = '#'.join(td)
                lists[hang][lie] = td
            else:
                continue

        self.render("pages/zclasstable.html", title="课程表", lists=lists)



#----------------------------------------教师界面------------------------------------------------------
class TeacherpageHandler(web.HtplHandler):
    pass

class T_MissionRestHandler(web.RestHandler):
    def get(self,tno):
        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            username = str(username)
        t_tno = username

        with self.db_cursor() as dc:
            sql = '''
            SELECT tno, cname, tmtime, tmplace, tmweek,cno
            FROM course INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
            WHERE tno=%s
            ORDER BY cno
            '''
            dc.execute(sql,[int(t_tno)])
            self.write_json(dc.fetchall_dicts())


class T_StudentRestHandler(web.RestHandler):
    def get(self,cno):
        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            username = str(username)
        t_tno = username

        with self.db_cursor() as dc:
            if cno :
                cno = int(cno)
                sql = '''
                SELECT  DISTINCT tno,cname,sno, sname,cno
                FROM (course INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                WHERE cno=%s
                '''
                dc.execute(sql,[cno])
                self.write_json(dc.fetchall_dicts())
            else:
                sql = '''
                SELECT  DISTINCT tno,cname,sno, sname,cno
                FROM (course INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                WHERE tno=%s
                ORDER BY cno
                '''
                dc.execute(sql,[int(t_tno)])
                self.write_json(dc.fetchall_dicts())


class T_GradeRestHandler(web.RestHandler):
    def get(self,gn):
        username = self.get_cookie("username_cookie")
        if not username:
            self.redirect("/error")
        else:
            username = str(username)
        t_tno = username

        with self.db_cursor() as dc:
            if gn :
                gn = int(gn)
                if gn<1000:
                    sql = '''
                    SELECT DISTINCT tno,cname,g_sno, sname, grade,g_cno,gn
                    FROM (course INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                    WHERE g_cno=%s
                    ORDER BY g_cno
                    '''
                    dc.execute(sql,[gn])
                    self.write_json(dc.fetchall_dicts())
                else:
                    sql = '''
                    SELECT DISTINCT tno,cname,g_sno, sname, grade,g_cno,gn
                    FROM (course INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                    WHERE gn=%s
                    '''
                    dc.execute(sql,[gn])
                    row = dc.fetchone_dict()
                    if row:
                        self.write_json(row)
                    else:
                        self.set_status(404)
            else:
                sql = '''
                SELECT DISTINCT tno,cname,g_sno, sname, grade,g_cno,gn
                FROM (course INNER JOIN (student INNER JOIN grade ON student.sno = grade.g_sno) ON course.cno = grade.g_cno) INNER JOIN (teacher INNER JOIN tmission ON teacher.tno = tmission.tm_tno) ON course.cno = tmission.tm_cno
                WHERE tno=%s
                ORDER BY g_cno
                '''
                dc.execute(sql,[int(t_tno)])
                self.write_json(dc.fetchall_dicts())
        
    def put(self,gn):
        t_grade= self.read_json()
        with self.db_cursor() as dc:
            sql = ''' 
            UPDATE grade SET 
            gn=%s,g_cno=%s,g_sno=%s,grade=%s
            WHERE gn=%s 
            '''
            dc.execute(sql, [t_grade['gn'],t_grade['g_cno'],t_grade['g_sno'],t_grade['grade'],gn])
            dc.commit()
        self.write_json(t_grade)