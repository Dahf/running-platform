-- Change heart rate fields to DECIMAL (no rounding) for activities and segment_efforts
ALTER TABLE public.activities
  ALTER COLUMN average_heart_rate TYPE DECIMAL USING average_heart_rate::DECIMAL,
  ALTER COLUMN max_heart_rate TYPE DECIMAL USING max_heart_rate::DECIMAL;

ALTER TABLE public.segment_efforts
  ALTER COLUMN average_heart_rate TYPE DECIMAL USING average_heart_rate::DECIMAL,
  ALTER COLUMN max_heart_rate TYPE DECIMAL USING max_heart_rate::DECIMAL;
