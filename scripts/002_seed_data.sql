-- Insert some sample segments for testing
INSERT INTO public.segments (name, activity_type, distance, elevation_gain, polyline, start_lat, start_lng, end_lat, end_lng)
VALUES 
  ('Downtown Sprint', 'run', 5000, 50, '_p~iF~ps|U_ulLnnqC_mqNvxq`@', 37.7749, -122.4194, 37.7849, -122.4094),
  ('Hill Climb Challenge', 'ride', 8000, 250, 'yzocFf~pbLwc@sj@kx@yx@', 37.7849, -122.4094, 37.7949, -122.3994),
  ('River Trail', 'run', 10000, 100, '_gzeF`qqrL|d@md@td@{d@', 37.7649, -122.4294, 37.7749, -122.4194),
  ('Mountain Pass', 'ride', 25000, 800, 'eqheFbf~uL}g@~h@ml@~l@', 37.7949, -122.3994, 37.8049, -122.3894);
