-- REDATE Dating App - Database Schema

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(20),
  looking_for VARCHAR(20),
  bio TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_last_seen TIMESTAMP DEFAULT NOW(),
  photos JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  tier VARCHAR(20) DEFAULT 'free', -- free, plus, gold, platinum
  premium_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_location ON users(location_lat, location_lng) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tier ON users(tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_age ON users(birth_date) WHERE deleted_at IS NULL;

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  max_distance_km INT DEFAULT 50,
  min_age INT DEFAULT 18,
  max_age INT DEFAULT 100,
  looking_for_gender VARCHAR(20)[],
  premium_filters JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Swipes
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL, -- 'like', 'dislike', 'superlike'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_swipes_action ON swipes(action);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  is_unmatched BOOLEAN DEFAULT FALSE,
  unmatched_at TIMESTAMP,
  UNIQUE(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

CREATE INDEX idx_matches_user1 ON matches(user1_id) WHERE is_unmatched = FALSE;
CREATE INDEX idx_matches_user2 ON matches(user2_id) WHERE is_unmatched = FALSE;

-- Messages (stored in Firebase, but keep meta in Postgres)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  firebase_message_id VARCHAR(255),
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, location, gif
  content TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_match ON messages(match_id, created_at);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL, -- plus, gold, platinum
  stripe_subscription_id VARCHAR(255),
  apple_transaction_id VARCHAR(255),
  google_purchase_token VARCHAR(255),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  current_period_end TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- active, canceled, past_due
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Boosts (one-time purchases)
CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  boost_type VARCHAR(20) NOT NULL, -- super_like, boost_30m, boost_1h, undo_swipe
  stripe_payment_intent_id VARCHAR(255),
  apple_transaction_id VARCHAR(255),
  google_purchase_token VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();