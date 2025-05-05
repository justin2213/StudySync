-- Task entry script - for class data

INSERT INTO Events (
  EventID, 
  UserID, 
  Title, 
  EventType, 
  ScheduledStartTime, 
  ScheduledEndTime, 
  Duration, 
  ClassID
)
SELECT 
  gen_random_uuid(),               
  s.UserID,                     
  c.ClassName,                    
  'class',               
  (d.day + c.ClassStart)::timestamp, 
  (d.day + c.ClassEnd)::timestamp,  
  EXTRACT(
    EPOCH FROM (
      (timestamp '2000-01-01' + c.ClassEnd) 
      - (timestamp '2000-01-01' + c.ClassStart)
    )
  ) / 60,                          
  c.ClassID                       
FROM Classes c
JOIN Semesters s 
  ON c.SemesterID = s.SemesterID
JOIN generate_series(s.SemesterStart, s.SemesterEnd, interval '1 day') AS d(day)
  ON TRUE
WHERE to_char(d.day, 'FMDay') = ANY(c.ClassDays);
