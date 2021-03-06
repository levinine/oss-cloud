CREATE TABLE `contributors` (
  `username` varchar(40) NOT NULL,
  `firstName` varchar(20) DEFAULT NULL,
  `lastName` varchar(20) DEFAULT NULL,
  `link` varchar(60) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `visibleContributionCount` int(11) DEFAULT NULL,
  `updated` varchar(3) DEFAULT 'NO',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `contributions` (
  `repo` varchar(120) NOT NULL,
  `owner` varchar(40) NOT NULL,
  `number` int(11) NOT NULL,
  `link` varchar(200) DEFAULT NULL,
  `title` varchar(300) DEFAULT NULL,
  `dateCreated` datetime DEFAULT NULL,
  `status` varchar(7) DEFAULT NULL,
  `author` varchar(40) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `owner_FK_idx` (`author`),
  CONSTRAINT `author_FK` FOREIGN KEY (`author`) REFERENCES `contributors` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `lastUpdated` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lastUpdated` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `lastUpdated` (`lastUpdated`) VALUES (0);