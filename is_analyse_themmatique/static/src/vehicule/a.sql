WITH t as ( 
        SELECT tr3.datej,tr3.route as id_cirdet,tr3.circuit as id_circuit,
          tr3.vehicule as deviceid, tr3.lt as ltr,tr3.methode as meth,tr3.pl,
		  case when SUM(tr3.taux)<=100  then SUM(tr3.taux) else 100 end taux
        FROM
          is_taux_taux_tr tr3
        WHERE tr3.datej = current_date AND--tr3.dh >= ?::timestamp AND tr3.dh <= ?::timestamp  
            tr3.methode != 1
        GROUP BY tr3.datej,tr3.route,tr3.circuit,tr3.vehicule,tr3.lt,tr3.methode,tr3.pl
    ),
	longueur_circuit as(
		
		SELECT 
		  dc.id AS circuit_id,
		  SUM(ST_Length(dr.geom::geography)) AS lt
		FROM
		  public.is_decoupage_circuit_route_rel dcr
		  INNER JOIN public.is_decoupage_circuits dc ON dcr.circuit_id = dc.id
		  INNER JOIN public.is_decoupage_routes dr ON dcr.route_id = dr.id
		GROUP BY dc.id 
		
	) 	
-- 	,
--     tt as (
--         select * 
-- 			d.id,t.datej, cr."id" as idcircuit,
-- 			case when round(sum(t.ltr/(lc.lt*1000)*t.taux))  <=100 then round(sum(t.ltr/(lc.lt*1000)*t.taux)) else 100 end as taux,
--             cr.name as circuit,cr.frequence_id as  frq, d.device as vehicule, pl.hdeb as dd, pl.hfin as df
--         FROMA
--             public.is_decoupage_circuits cr INNER JOIN t ON (cr."id" = t.id_circuit) 
--             INNER JOIN public.fleet_vehicle d ON (t.deviceid = d.id) --and t.pl=1 
-- 			INNER JOIN longueur_circuit lc ON (cr."id" = lc.circuit_id) 
--             INNER JOIN PUBLIC.is_planning_is_planning  pl on pl.deviceid = d.id 
--         where pl.datej = current_date 
--         group by d.id,t.datej, cr."id" ,cr.name ,cr.frequence_id , d.device , pl.hdeb, pl.hfin
--         order by cr."name"
--     )

		select  
			d.id,t.datej, cr."id" as idcircuit,
			case when round(sum(t.ltr/(lc.lt*1000)*t.taux))  <=100 then round(sum(t.ltr/(lc.lt*1000)*t.taux)) else 100 end as taux,
            cr.name as circuit,cr.frequence_id as  frq, d.device as vehicule--, pl.hdeb as dd, pl.hfin as df
        FROM
            public.is_decoupage_circuits cr INNER JOIN t ON (cr."id" = t.id_circuit) 
            INNER JOIN public.fleet_vehicle d ON (t.deviceid = d.id) --and t.pl=1 
			INNER JOIN longueur_circuit lc ON (cr."id" = lc.circuit_id) 
            INNER JOIN PUBLIC.is_planning_is_planning  pl on pl.deviceid = d.id 
        where pl.datej = current_date and 
        group by d.id,t.datej, cr."id" ,cr.name ,cr.frequence_id , d.device --, pl.hdeb, pl.hfin
        order by cr."name"
		
--     select tt.circuit, tt.vehicule, tt.taux ,  
--     tt.dd, tt.df
--     from tt  
--     order by circuit
