require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const MockTest = require('../src/models/MockTest');
const Question = require('../src/models/Question');
const TestAttempt = require('../src/models/TestAttempt');
const Post = require('../src/models/Post');
const Reel = require('../src/models/Reel');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/exam-portal-test';

describe('Competitive Exam Portal - API Test Suite', () => {
  let userToken = '';
  let userCookie = '';
  let userId = '';
  let createdTestId = '';
  let sampleQuestionId = '';
  let createdAttemptId = '';
  let createdPostId = '';
  let createdReelId = '';

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
    // Clean test collections
    await Promise.all([
      User.deleteMany({}),
      MockTest.deleteMany({}),
      Question.deleteMany({}),
      TestAttempt.deleteMany({}),
      Post.deleteMany({}),
      Reel.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({}),
      MockTest.deleteMany({}),
      Question.deleteMany({}),
      TestAttempt.deleteMany({}),
      Post.deleteMany({}),
      Reel.deleteMany({}),
    ]);
    await mongoose.connection.close();
  });

  // 1. Health check
  describe('GET /api/health', () => {
    it('should return 200 OK and server status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // 2. Authentication & Authorization
  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register - should register a new student', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Arjun Verma',
          email: 'arjun@example.com',
          password: 'password123',
          examInterests: ['UPSC', 'SSC'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('arjun@example.com');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();

      userCookie = res.headers['set-cookie'];
      userToken = res.body.data.token;
      userId = res.body.data.user._id;
    });

    it('POST /api/auth/register - should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Arjun',
          email: 'arjun@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login - should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'arjun@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login - should authenticate student and set cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'arjun@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('arjun@example.com');
      userCookie = res.headers['set-cookie'];
    });

    it('GET /api/auth/me - should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('arjun@example.com');
    });

    it('GET /api/auth/me - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 3. Mock Tests & Test Attempt Scoring
  describe('Mock Test & Scoring Engine', () => {
    beforeAll(async () => {
      // Create a mock test in DB
      const test = await MockTest.create({
        title: 'UPSC Prelims Mock 01',
        description: 'General Studies Paper I simulation',
        category: 'UPSC',
        subject: 'General Studies',
        duration: 60,
        totalQuestions: 2,
        maxMarks: 10,
        negativeMarking: 0.5,
        difficulty: 'Medium',
      });
      createdTestId = test._id.toString();

      // Create 2 questions: Q1 (correct is opt 0), Q2 (correct is opt 1)
      const q1 = await Question.create({
        testId: test._id,
        questionText: 'What is the capital of India?',
        options: [
          { text: 'New Delhi', isCorrect: true },
          { text: 'Mumbai', isCorrect: false },
          { text: 'Kolkata', isCorrect: false },
          { text: 'Chennai', isCorrect: false },
        ],
        explanation: 'New Delhi was declared the capital of India in 1911.',
        marks: 5,
        questionNumber: 1,
      });
      sampleQuestionId = q1._id.toString();

      await Question.create({
        testId: test._id,
        questionText: 'Which planet is known as the Red Planet?',
        options: [
          { text: 'Venus', isCorrect: false },
          { text: 'Mars', isCorrect: true },
          { text: 'Jupiter', isCorrect: false },
          { text: 'Saturn', isCorrect: false },
        ],
        explanation: 'Mars is reddish due to iron oxide on its surface.',
        marks: 5,
        questionNumber: 2,
      });
    });

    it('GET /api/tests - should list available mock tests', async () => {
      const res = await request(app)
        .get('/api/tests')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tests.length).toBeGreaterThan(0);
    });

    it('POST /api/tests/:id/start - should start a new test attempt without leaking correct answers', async () => {
      const res = await request(app)
        .post(`/api/tests/${createdTestId}/start`)
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attempt).toBeDefined();
      expect(res.body.data.test.questions.length).toBe(2);

      // Verify isCorrect is stripped from questions
      const firstQ = res.body.data.test.questions[0];
      firstQ.options.forEach((opt) => {
        expect(opt.isCorrect).toBeUndefined();
      });

      createdAttemptId = res.body.data.attempt._id;
    });

    it('POST /api/tests/attempts/:id/submit - should calculate scores accurately with negative marking', async () => {
      // Answer Q1 correctly (opt 0 -> +5 marks), Answer Q2 incorrectly (opt 0 instead of opt 1 -> -0.5 marks)
      const allQs = await Question.find({ testId: createdTestId });
      const answersPayload = [
        { questionId: allQs[0]._id, selectedOption: 0 },
        { questionId: allQs[1]._id, selectedOption: 0 },
      ];

      const res = await request(app)
        .post(`/api/tests/attempts/${createdAttemptId}/submit`)
        .set('Cookie', userCookie)
        .send({
          answers: answersPayload,
          timeTaken: 120,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const attempt = res.body.data.attempt;
      expect(attempt.status).toBe('completed');
      expect(attempt.correctAnswers).toBe(1);
      expect(attempt.incorrectAnswers).toBe(1);
      // Score: 5 - 0.5 = 4.5
      expect(attempt.totalScore).toBe(4.5);
      expect(attempt.accuracy).toBe(50);
    });

    it('POST /api/tests/attempts/:id/submit - should prevent duplicate re-submission of completed attempt', async () => {
      const res = await request(app)
        .post(`/api/tests/attempts/${createdAttemptId}/submit`)
        .set('Cookie', userCookie)
        .send({ answers: [] });

      expect(res.status).toBe(400);
    });

    it('GET /api/tests/attempts/:id/result - should retrieve solutions and explanations', async () => {
      const res = await request(app)
        .get(`/api/tests/attempts/${createdAttemptId}/result`)
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questionsWithSolutions).toBeDefined();
      expect(res.body.data.questionsWithSolutions.length).toBe(2);
      expect(res.body.data.questionsWithSolutions[0].explanation).toBeDefined();
    });

    it('GET /api/tests/history - should list student test history', async () => {
      const res = await request(app)
        .get('/api/tests/history')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.history.length).toBe(1);
    });
  });

  // 4. Dashboard Stats
  describe('Dashboard Analytics', () => {
    it('GET /api/dashboard - should return user stats reflecting real attempt', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview.totalAttempts).toBe(1);
      expect(res.body.data.overview.averageScore).toBe(4.5);
    });

    it('GET /api/dashboard/performance-chart - should return chart points', async () => {
      const res = await request(app)
        .get('/api/dashboard/performance-chart')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  // 5. Community Posts
  describe('Community Posts Module', () => {
    it('POST /api/posts - should create a new community post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Cookie', userCookie)
        .field('title', 'Exam Preparation Strategy 2027')
        .field('content', 'Focus heavily on NCERT basics and daily mock test revisions.');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const post = res.body.data.post || res.body.data;
      expect(post.title).toBe('Exam Preparation Strategy 2027');
      createdPostId = post._id;
    });

    it('POST /api/posts/:id/like - should toggle like on post', async () => {
      // First like
      const res1 = await request(app)
        .post(`/api/posts/${createdPostId}/like`)
        .set('Cookie', userCookie);

      expect(res1.status).toBe(200);
      expect(res1.body.data.isLiked).toBe(true);
      expect(res1.body.data.likesCount).toBe(1);

      // Unlike
      const res2 = await request(app)
        .post(`/api/posts/${createdPostId}/like`)
        .set('Cookie', userCookie);

      expect(res2.status).toBe(200);
      expect(res2.body.data.isLiked).toBe(false);
      expect(res2.body.data.likesCount).toBe(0);
    });

    it('POST /api/posts/:id/comments - should add a comment to post', async () => {
      const res = await request(app)
        .post(`/api/posts/${createdPostId}/comments`)
        .set('Cookie', userCookie)
        .send({ content: 'Great tips, thanks!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const post = res.body.data.post || res.body.data;
      expect(post.comments.length).toBe(1);
    });

    it('POST /api/posts/:id/save - should toggle bookmark on post', async () => {
      const res = await request(app)
        .post(`/api/posts/${createdPostId}/save`)
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.isSaved).toBe(true);
    });

    it('GET /api/posts/saved - should list saved posts', async () => {
      const res = await request(app)
        .get('/api/posts/saved')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.posts.length).toBe(1);
    });
  });

  // 6. Educational Reels
  describe('Educational Reels Module', () => {
    it('POST /api/reels - should upload an educational reel with fallback', async () => {
      const fakeVideoBuffer = Buffer.from('mock video content stream');

      const res = await request(app)
        .post('/api/reels')
        .set('Cookie', userCookie)
        .field('caption', 'Quick 30s Vedic Maths trick #maths #trick')
        .field('description', 'How to multiply by 11 in 2 seconds')
        .attach('video', fakeVideoBuffer, 'trick.mp4');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const reel = res.body.data.reel || res.body.data;
      expect(reel.videoUrl).toBeDefined();
      createdReelId = reel._id;
    });

    it('POST /api/reels/:id/like - should toggle like on reel', async () => {
      const res = await request(app)
        .post(`/api/reels/${createdReelId}/like`)
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.isLiked).toBe(true);
    });

    it('POST /api/reels/:id/save - should bookmark reel', async () => {
      const res = await request(app)
        .post(`/api/reels/${createdReelId}/save`)
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.isSaved).toBe(true);
    });

    it('GET /api/reels/saved - should list saved reels', async () => {
      const res = await request(app)
        .get('/api/reels/saved')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.reels.length).toBe(1);
    });
  });

  // 7. Profile & Analytics
  describe('Profile & Performance Module', () => {
    it('GET /api/profile - should return candidate profile with stats', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      const profile = res.body.data.profile || res.body.data.user;
      expect(profile.name).toBe('Arjun Verma');
      expect(profile.stats.testAttemptCount).toBe(1);
      expect(profile.stats.postCount).toBe(1);
      expect(profile.stats.reelCount).toBe(1);
    });

    it('PUT /api/profile - should update profile information', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Cookie', userCookie)
        .field('name', 'Arjun Verma (AIR 1 Dreamer)')
        .field('bio', 'Aspiring Civil Servant.')
        .field('education', 'B.Sc Physics')
        .field('examInterests', JSON.stringify(['UPSC CSE', 'MPSC']));

      expect(res.status).toBe(200);
      const user = res.body.data.user || res.body.data;
      expect(user.name).toBe('Arjun Verma (AIR 1 Dreamer)');
      expect(user.bio).toBe('Aspiring Civil Servant.');
    });

    it('PUT /api/auth/password - should update student password securely', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Cookie', userCookie)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login works with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'arjun@example.com',
          password: 'newpassword456',
        });

      expect(loginRes.status).toBe(200);
    });

    it('POST /api/auth/logout - should clear session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
