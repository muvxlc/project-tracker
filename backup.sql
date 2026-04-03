/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.5-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: project_tracker
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `agencies`
--

DROP TABLE IF EXISTS `agencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `agencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agencies_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agencies`
--

LOCK TABLES `agencies` WRITE;
/*!40000 ALTER TABLE `agencies` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `agencies` VALUES
(1,'การเงิน'),
(2,'ฝ่ายเวช');
/*!40000 ALTER TABLE `agencies` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categories` VALUES
(1,'โครงการ'),
(2,'แผนงาน');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `fiscal_years`
--

DROP TABLE IF EXISTS `fiscal_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiscal_years` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fiscal_years_year_unique` (`year`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fiscal_years`
--

LOCK TABLES `fiscal_years` WRITE;
/*!40000 ALTER TABLE `fiscal_years` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `fiscal_years` VALUES
(1,2568),
(2,2569);
/*!40000 ALTER TABLE `fiscal_years` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `project_files`
--

DROP TABLE IF EXISTS `project_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `project_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `project_files_project_id_projects_id_fk` (`project_id`),
  CONSTRAINT `project_files_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_files`
--

LOCK TABLES `project_files` WRITE;
/*!40000 ALTER TABLE `project_files` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `project_files` VALUES
(1,'7e205f71-2f6b-11f1-8122-7aebffb5c2a4',1,'รับสมัครนักวิชาการสาธารณสุขรายเดือนกพ69แก.pdf','/uploads/รับสมัครนักวิชาการสาธารณสุขรายเดือนกพ69แก-1775139763822.pdf',177183,'application/pdf',NULL,'2026-04-02 14:22:43'),
(3,'7e206112-2f6b-11f1-8122-7aebffb5c2a4',1,'แบบตอบรับเข้าร่วมอบรม CTMR 8-10 เม.ย. 69.pdf','/uploads/แบบตอบรับเข้าร่วมอบรม CTMR 8-10 เม.ย. 69-1775181843239.pdf',82696,'application/pdf','แก้ 1','2026-04-03 02:04:03'),
(4,'7e206172-2f6b-11f1-8122-7aebffb5c2a4',1,'แบบตอบรับเข้าร่วมอบรม CTMR 8-10 เม.ย. 69.docx','/uploads/แบบตอบรับเข้าร่วมอบรม CTMR 8-10 เม.ย. 69-1775182409931.docx',9373,'application/vnd.openxmlformats-officedocument.wordprocessingml.document','แก้ 2','2026-04-03 02:13:29'),
(5,'7e2061b4-2f6b-11f1-8122-7aebffb5c2a4',4,'การเรียกเก็บ HCT ยาน้ำเสริมธาตุเหล็ก.pdf','/uploads/การเรียกเก็บ HCT ยาน้ำเสริมธาตุเหล็ก-1775204218331.pdf',2095995,'application/pdf','รับเออกสาร','2026-04-03 08:16:58'),
(7,'7e2061f2-2f6b-11f1-8122-7aebffb5c2a4',4,'แบบตอบรับเข้าร่วมอบรม CTMR 8-10 เม.ย. 69 (1).docx','/uploads/แบบตอบรับเข้าร่วมอบรม CTMR 8-10 เม.ย. 69 (1)-1775207330876.docx',9569,'application/vnd.openxmlformats-officedocument.wordprocessingml.document','แก้ไข ครั้งที่ 2','2026-04-03 09:08:50'),
(8,'7e206234-2f6b-11f1-8122-7aebffb5c2a4',4,'แบบรายงานผลการดำเนินงานโครงการตามแผนปฏิ.pdf','/uploads/แบบรายงานผลการดำเนินงานโครงการตามแผนปฏิ-1775215738707.pdf',207469,'application/pdf','edit 3','2026-04-03 11:28:58'),
(9,'7e206274-2f6b-11f1-8122-7aebffb5c2a4',4,'แบบรายงานผลการดำเนินงานโครงการตามแผนปฏิ.pdf','projects/4/db9512e1-2478-4b21-ab43-78d5d9c6ed3a.pdf',207469,'application/pdf','test','2026-04-03 14:38:29');
/*!40000 ALTER TABLE `project_files` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `project_statuses`
--

DROP TABLE IF EXISTS `project_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `color` varchar(50) DEFAULT 'blue',
  `order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_statuses`
--

LOCK TABLES `project_statuses` WRITE;
/*!40000 ALTER TABLE `project_statuses` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `project_statuses` VALUES
(1,'รับเอกสาร','blue',1),
(2,'ตรวจสอบ2','yellow',2),
(3,'อนุมัติ (ผอ.รพ)','orange',3),
(4,'อนุมัติ (นายแพทย์ สสจ.)','pink',4),
(10,'ดำเนินโครงการเสร็จสิ้น','green',5),
(11,'ส่งกลับแก้ไข','red',6);
/*!40000 ALTER TABLE `project_statuses` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `fiscal_year_id` int(11) NOT NULL,
  `quarter_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `agency_id` int(11) NOT NULL,
  `responsible_id` int(11) DEFAULT NULL,
  `implementation_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `created_by_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `status_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_fiscal_year_id_fiscal_years_id_fk` (`fiscal_year_id`),
  KEY `projects_category_id_categories_id_fk` (`category_id`),
  KEY `projects_agency_id_agencies_id_fk` (`agency_id`),
  KEY `projects_created_by_id_users_id_fk` (`created_by_id`),
  KEY `fk_projects_status_id` (`status_id`),
  KEY `fk_projects_responsible_id_responsible_persons` (`responsible_id`),
  CONSTRAINT `fk_projects_responsible_id_responsible_persons` FOREIGN KEY (`responsible_id`) REFERENCES `responsible_persons` (`id`),
  CONSTRAINT `fk_projects_status_id` FOREIGN KEY (`status_id`) REFERENCES `project_statuses` (`id`),
  CONSTRAINT `projects_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `projects_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `projects_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `projects_fiscal_year_id_fiscal_years_id_fk` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_years` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `projects` VALUES
(1,'ทดสอบ1',2,1,1,1,2,'2026-04-02',NULL,10000.00,'pending','aaa',1,'2026-04-02 08:54:46','2026-04-03 13:35:57',4),
(4,'ทดสอบ 2',2,1,2,2,2,'2026-04-03',NULL,500000.00,'pending','esdfsdfsdfsdfssdfsd',1,'2026-04-03 08:16:53','2026-04-03 14:25:44',4);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `quarters`
--

DROP TABLE IF EXISTS `quarters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quarters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quarters`
--

LOCK TABLES `quarters` WRITE;
/*!40000 ALTER TABLE `quarters` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `quarters` VALUES
(1,'ไตรมาส 1'),
(2,'ไตรมาส 2'),
(3,'ไตรมาส 3'),
(4,'ไตรมาส 4');
/*!40000 ALTER TABLE `quarters` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `responsible_persons`
--

DROP TABLE IF EXISTS `responsible_persons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsible_persons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `agency_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `responsible_persons_agency_id_agencies_id_fk` (`agency_id`),
  CONSTRAINT `responsible_persons_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsible_persons`
--

LOCK TABLES `responsible_persons` WRITE;
/*!40000 ALTER TABLE `responsible_persons` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `responsible_persons` VALUES
(2,'นายทดสอบ ทดสอบ1',NULL);
/*!40000 ALTER TABLE `responsible_persons` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `roles` VALUES
(2,'admin'),
(3,'approver'),
(1,'superadmin'),
(4,'user');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `thai_id` varchar(13) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `agency_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_thai_id_unique` (`thai_id`),
  KEY `users_role_id_roles_id_fk` (`role_id`),
  KEY `users_agency_id_agencies_id_fk` (`agency_id`),
  CONSTRAINT `users_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'admin','$2b$10$AP5Q8MTR5DACkErCNirFyOaaDrkDlB5VUOhzbN3yOVi4IxAUYw.W6','','Admin',1,1,'2026-04-02 03:44:15'),
(5,'test','$2b$10$JsaRvH85MkLziPJ/2LdoPupD02pat/Qcx3BAgXj0Tb4LVT0UYiOZ.','1234567891234','test',4,1,'2026-04-03 08:33:58'),
(6,'ap','$2b$10$oVb3GUqCObd3.7NNK0xVV.eaoyp4jH60y5DmiTA8ov89VC4yCaUaW','123','ap',3,1,'2026-04-03 08:34:23'),
(7,'thaid_1920600199321',NULL,'1920600199321','นาย กิตติศักดิ์ สวัสดิมงคล',1,NULL,'2026-04-03 12:16:51'),
(8,'thaid_1809800163124',NULL,'1809800163124','น.ส. สินัฐนันท์ มีแย้ม',4,NULL,'2026-04-03 12:18:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-04-03 22:48:34
