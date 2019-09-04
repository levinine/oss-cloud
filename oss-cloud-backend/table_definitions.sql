CREATE TABLE `contributions` (
  `repo` varchar(120) NOT NULL,
  `owner` varchar(40) NOT NULL,
  `number` int(11) NOT NULL,
  `link` varchar(200) DEFAULT NULL,
  `title` varchar(300) DEFAULT NULL,
  `dateCreated` datetime DEFAULT NULL,
  `status` varchar(7) DEFAULT NULL,
  `author` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`repo`,`owner`,`number`),
  KEY `owner_FK_idx` (`author`),
  CONSTRAINT `author_FK` FOREIGN KEY (`author`) REFERENCES `contributors` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4


CREATE TABLE `contributors` (
  `username` varchar(40) NOT NULL,
  `firstName` varchar(20) DEFAULT NULL,
  `lastName` varchar(20) DEFAULT NULL,
  `link` varchar(60) DEFAULT NULL,
  `visibleContributionCount` int(11) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4