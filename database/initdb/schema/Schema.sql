CREATE TABLE Semesters (
    SemesterID   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID       TEXT NOT NULL,
    SemesterName VARCHAR(255) NOT NULL,
    SemesterStart DATE NOT NULL,
    SemesterEnd   DATE NOT NULL
);

CREATE TABLE Classes (
    ClassID    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    SemesterID UUID NOT NULL
      REFERENCES Semesters(SemesterID)
      ON DELETE CASCADE,
    ClassName  VARCHAR(255) NOT NULL,
    ClassStart TIME NOT NULL,
    ClassEnd   TIME NOT NULL,
    ClassDays  TEXT[]
);

CREATE TABLE Grade_Distribution (
    CategoryID   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ClassID      UUID NOT NULL
      REFERENCES Classes(ClassID)
      ON DELETE CASCADE,
    CategoryName VARCHAR(100) NOT NULL,
    Weight       INT NOT NULL
);

CREATE TABLE Grades (
    GradeID      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ClassID      UUID NOT NULL
      REFERENCES Classes(ClassID)
      ON DELETE CASCADE,
    CategoryID   UUID NOT NULL
      REFERENCES Grade_Distribution(CategoryID)
      ON DELETE CASCADE,
    AssignmentName VARCHAR(255),
    Score         DECIMAL(5,2) NOT NULL,
    MaxScore      DECIMAL(5,2) NOT NULL
);

CREATE TYPE event_type AS ENUM ('class', 'meeting', 'assignment', 'other');

CREATE TABLE Events (
    EventID            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID             TEXT NOT NULL,
    Title              VARCHAR(255) NOT NULL,
    Description        TEXT NULL,
    EventType          event_type NOT NULL,
    ScheduledStartTime TIMESTAMP NULL,
    ScheduledEndTime   TIMESTAMP NULL,
    Duration           INT NULL,
    ClassID            UUID NULL
      REFERENCES Classes(ClassID)
      ON DELETE CASCADE,
    Completed          BOOLEAN DEFAULT FALSE
);
