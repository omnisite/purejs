drop table pjs_instance;

create table pjs_instance
(
	inst_id		int(11) unsigned not null auto_increment,
    inst_type	varchar(20) not null,
	inst_data	text,
    primary key (inst_id)
);

insert into pjs_instance values (0, '$cont', '{"inid":"IN1000002","name":"test-cont-01","type":"$cont","func":"of","argx":"\'test-cont-01\'","argf":"function mf(t) {\n    return function $_pure(f) {\n        return f(t);\n    }\n}","method":"","argm":"","argr":"function(x) {\n    console.log(x);\n}"}');

select * from pjs_instance;

create table 