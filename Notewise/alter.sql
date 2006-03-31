alter table object_id change column type type ENUM('kernel','note','relationship','sandbox') NOT NULL;

insert into object_id (user,type) select user.id, 'sandbox' from user;
