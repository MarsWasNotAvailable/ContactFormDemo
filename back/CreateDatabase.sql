CREATE SCHEMA IF NOT EXISTS `marsdemo_default_db` DEFAULT CHARACTER SET utf8 ;
USE `marsdemo_default_db` ;

CREATE TABLE IF NOT EXISTS `marsdemo_default_db`.`Contact` (
  `Mail` VARCHAR(255) NOT NULL,
  `NameFirst` TINYTEXT NOT NULL,
  `NameLast` TINYTEXT NOT NULL,
  `DateAdded` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `Postcode` CHAR(5) NOT NULL,
  `IP` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`Mail`),
  UNIQUE INDEX `Mail_UNIQUE` (`Mail` ASC) VISIBLE )
ENGINE = InnoDB;

USE `marsdemo_default_db` ;
