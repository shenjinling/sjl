DROP DATABASE IF EXISTS datebase;

DROP ROLE IF EXISTS llms; 

-- 创建一个登陆角色（用户），用户名datebasedbo, 缺省密码pass
CREATE ROLE llms LOGIN
  ENCRYPTED PASSWORD 'md568cefad35fed037c318b1e44cc3480cf' -- password: pass
  NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;

CREATE DATABASE datebase WITH OWNER = llms ENCODING = 'UTF8';


DROP TABLE IF EXISTS student;
CREATE TABLE IF NOT EXISTS student  (
    sno         INTEGER,        --学号
    stu_mno     INTEGER,        --专业编号
    skey        INTEGER,        --学生密码
    sname       TEXT,           --学生名
    ssex        TEXT,           --性别
    PRIMARY KEY(sno)
);


DROP TABLE IF EXISTS course;
CREATE TABLE IF NOT EXISTS course  (
    cno      INTEGER,        --学号
    cname    TEXT,           --课程名
    ccredit  INTEGER,        --成绩
    PRIMARY KEY(cno)
);




DROP TABLE IF EXISTS grade;
CREATE TABLE IF NOT EXISTS grade  (
    gn         INTEGER,        --编号
    g_sno      INTEGER,        --学号
    g_cno      INTEGER,        --课程号
    grade      INTEGER,        --成绩
    PRIMARY KEY(gn,g_cno,g_sno)
);
CREATE SEQUENCE seq_grade_gn 
    START 10000 INCREMENT 1 OWNED BY grade.gn;
ALTER TABLE grade ALTER gn 
    SET DEFAULT nextval('seq_grade_gn');




DROP TABLE IF EXISTS plan;
CREATE TABLE IF NOT EXISTS plan  (
    pn      INTEGER,       --编号
    p_cno   INTEGER,       --课程编号
    p_mno   INTEGER,       --系编号
    pterm     TEXT,        --学期
    PRIMARY KEY(pn,p_cno,p_mno)
);
CREATE SEQUENCE seq_plan_pn 
    START 10000 INCREMENT 1 OWNED BY plan.pn;
ALTER TABLE plan ALTER pn 
    SET DEFAULT nextval('seq_plan_pn');


DROP TABLE IF EXISTS teacher;
CREATE TABLE IF NOT EXISTS teacher  (
    tno          INTEGER,    --教师编号
    tkey         INTEGER,    --教师密码
    tname        TEXT,       --教师名字
    tsex         TEXT,       --性别
    ttitle       TEXT,       --教师职称
    PRIMARY KEY(tno)
);


DROP TABLE IF EXISTS major;   
CREATE TABLE IF NOT EXISTS major  (
    mno      INTEGER,     --系编号
    mname      TEXT,      --系名称
    PRIMARY KEY(mno)
);


DROP TABLE IF EXISTS tmission;   
CREATE TABLE IF NOT EXISTS tmission  (
    tmn         INTEGER,     --编号
    tm_cno      INTEGER,     --课程编号
    tm_tno      INTEGER,     --教师编号
    tmplace     TEXT,        --上课地点
    tmtime      TEXT,        --上课时间点
    tmweek      TEXT,        --周数
    PRIMARY KEY(tmn,tm_cno,tm_tno,tmtime)
);
CREATE SEQUENCE seq_tmission_tmn 
    START 10000 INCREMENT 1 OWNED BY tmission.tmn;
ALTER TABLE tmission ALTER tmn 
    SET DEFAULT nextval('seq_tmission_tmn');



ALTER TABLE grade 
    ADD CONSTRAINT FK_GRADE_US_STUDENT FOREIGN KEY (g_sno) REFERENCES student(sno) ON DELETE CASCADE
    ON UPDATE CASCADE;


ALTER TABLE grade 
    ADD CONSTRAINT FK_GRADE_US_COURSE FOREIGN KEY (g_cno) REFERENCES course(cno) ON DELETE CASCADE
    ON UPDATE CASCADE;


ALTER TABLE student 
    ADD CONSTRAINT FK_STUDENT_US_MAJOR FOREIGN KEY (stu_mno) REFERENCES major(mno) ON DELETE CASCADE
    ON UPDATE CASCADE;


ALTER TABLE plan 
    ADD CONSTRAINT FK_PLAN_US_MAJOR FOREIGN KEY (p_mno) REFERENCES major(mno) ON DELETE CASCADE 
    ON UPDATE CASCADE;


ALTER TABLE plan 
    ADD CONSTRAINT FK_PLAN_US_COURSE FOREIGN KEY (p_cno) REFERENCES course(cno) ON DELETE CASCADE 
    ON UPDATE CASCADE;


ALTER TABLE tmission
    ADD CONSTRAINT FK_TMISSION_MS_COURSE FOREIGN KEY (tm_cno) REFERENCES course(cno) ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE tmission
    ADD CONSTRAINT FK_TMISSION_US_TEACHER FOREIGN KEY (tm_tno) REFERENCES teacher(tno) ON DELETE CASCADE
    ON UPDATE CASCADE;