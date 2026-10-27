require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const Post = require('../models/Post');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-portal'
    );
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await MockTest.deleteMany({});
    await Question.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data.');

    // ========== 1. CREATE DEMO USERS ==========
    const users = await User.create([
      {
        name: 'Tushar Bante',
        email: 'tushar@example.com',
        password: 'password123',
        bio: 'Aspiring civil servant preparing for UPSC and MPSC exams.',
        education: 'B.Tech in Computer Science',
        examInterests: ['UPSC', 'MPSC', 'SSC'],
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'password123',
        bio: 'Banking exam aspirant with a passion for teaching.',
        education: 'M.Com in Finance',
        examInterests: ['Banking', 'SSC', 'Railway'],
      },
    ]);

    console.log(`Created ${users.length} demo users.`);
    const [tushar, priya] = users;

    // ========== 2. CREATE MOCK TESTS ==========
    const testsData = [
      {
        title: 'SSC CGL Quantitative Aptitude',
        description: 'Practice test covering arithmetic, algebra, geometry, and data interpretation for SSC CGL.',
        category: 'SSC',
        subject: 'Quantitative Aptitude',
        duration: 20,
        totalQuestions: 10,
        maxMarks: 10,
        negativeMarking: 0.25,
        difficulty: 'Medium',
      },
      {
        title: 'IBPS PO Banking Awareness',
        description: 'Banking awareness and financial knowledge test for IBPS PO aspirants.',
        category: 'Banking',
        subject: 'Banking Awareness',
        duration: 15,
        totalQuestions: 10,
        maxMarks: 10,
        negativeMarking: 0.25,
        difficulty: 'Easy',
      },
      {
        title: 'RRB NTPC General Knowledge',
        description: 'General Knowledge and Current Affairs test for Railway NTPC examination.',
        category: 'Railway',
        subject: 'General Knowledge',
        duration: 15,
        totalQuestions: 10,
        maxMarks: 10,
        negativeMarking: 0.25,
        difficulty: 'Easy',
      },
      {
        title: 'MPSC Rajyaseva Prelims - Polity',
        description: 'Indian Polity and Governance questions for MPSC Rajyaseva Prelims.',
        category: 'MPSC',
        subject: 'Indian Polity',
        duration: 20,
        totalQuestions: 10,
        maxMarks: 10,
        negativeMarking: 0.25,
        difficulty: 'Hard',
      },
      {
        title: 'UPSC CSE Prelims - Indian History',
        description: 'Ancient, Medieval, and Modern Indian History for UPSC Civil Services Prelims.',
        category: 'UPSC',
        subject: 'Indian History',
        duration: 25,
        totalQuestions: 10,
        maxMarks: 10,
        negativeMarking: 0.33,
        difficulty: 'Hard',
      },
      {
        title: 'General English Grammar & Vocabulary',
        description: 'English grammar, vocabulary, and comprehension test for all competitive exams.',
        category: 'Other',
        subject: 'English',
        duration: 15,
        totalQuestions: 10,
        maxMarks: 10,
        negativeMarking: 0.25,
        difficulty: 'Medium',
      },
    ];

    const tests = await MockTest.create(testsData);
    console.log(`Created ${tests.length} mock tests.`);

    // ========== 3. CREATE QUESTIONS FOR EACH TEST ==========

    // SSC CGL Quantitative Aptitude Questions
    const sscQuestions = [
      {
        testId: tests[0]._id,
        questionText: 'If 3x + 5 = 20, what is the value of x?',
        options: [
          { text: '3', isCorrect: false },
          { text: '5', isCorrect: true },
          { text: '7', isCorrect: false },
          { text: '4', isCorrect: false },
        ],
        explanation: '3x + 5 = 20 => 3x = 15 => x = 5',
        marks: 1,
        questionNumber: 1,
      },
      {
        testId: tests[0]._id,
        questionText: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)',
        options: [
          { text: '154 sq cm', isCorrect: true },
          { text: '44 sq cm', isCorrect: false },
          { text: '88 sq cm', isCorrect: false },
          { text: '308 sq cm', isCorrect: false },
        ],
        explanation: 'Area = πr² = (22/7) × 7 × 7 = 154 sq cm',
        marks: 1,
        questionNumber: 2,
      },
      {
        testId: tests[0]._id,
        questionText: 'A train travels 360 km in 4 hours. What is its speed in km/h?',
        options: [
          { text: '80 km/h', isCorrect: false },
          { text: '90 km/h', isCorrect: true },
          { text: '100 km/h', isCorrect: false },
          { text: '70 km/h', isCorrect: false },
        ],
        explanation: 'Speed = Distance / Time = 360 / 4 = 90 km/h',
        marks: 1,
        questionNumber: 3,
      },
      {
        testId: tests[0]._id,
        questionText: 'What is 15% of 240?',
        options: [
          { text: '30', isCorrect: false },
          { text: '36', isCorrect: true },
          { text: '24', isCorrect: false },
          { text: '40', isCorrect: false },
        ],
        explanation: '15% of 240 = (15/100) × 240 = 36',
        marks: 1,
        questionNumber: 4,
      },
      {
        testId: tests[0]._id,
        questionText: 'The HCF of 12 and 18 is:',
        options: [
          { text: '2', isCorrect: false },
          { text: '3', isCorrect: false },
          { text: '6', isCorrect: true },
          { text: '9', isCorrect: false },
        ],
        explanation: 'Factors of 12: 1, 2, 3, 4, 6, 12. Factors of 18: 1, 2, 3, 6, 9, 18. HCF = 6',
        marks: 1,
        questionNumber: 5,
      },
      {
        testId: tests[0]._id,
        questionText: 'If a product is sold for ₹450 after a 10% discount, what was the original price?',
        options: [
          { text: '₹495', isCorrect: false },
          { text: '₹500', isCorrect: true },
          { text: '₹510', isCorrect: false },
          { text: '₹480', isCorrect: false },
        ],
        explanation: 'Let original price = x. x - 10% of x = 450. 0.9x = 450. x = 500.',
        marks: 1,
        questionNumber: 6,
      },
      {
        testId: tests[0]._id,
        questionText: 'The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?',
        options: [
          { text: '24', isCorrect: false },
          { text: '26', isCorrect: false },
          { text: '28', isCorrect: true },
          { text: '30', isCorrect: false },
        ],
        explanation: 'Sum of 5 numbers = 100. Sum of 4 numbers = 72. Excluded number = 100 - 72 = 28.',
        marks: 1,
        questionNumber: 7,
      },
      {
        testId: tests[0]._id,
        questionText: 'A man walks at 5 km/h for 6 hours and at 4 km/h for 2 hours. His average speed is:',
        options: [
          { text: '4.5 km/h', isCorrect: false },
          { text: '4.75 km/h', isCorrect: true },
          { text: '5 km/h', isCorrect: false },
          { text: '4.25 km/h', isCorrect: false },
        ],
        explanation: 'Total distance = 30 + 8 = 38 km. Total time = 8 hours. Average speed = 38/8 = 4.75 km/h.',
        marks: 1,
        questionNumber: 8,
      },
      {
        testId: tests[0]._id,
        questionText: 'What is the compound interest on ₹10,000 at 10% per annum for 2 years?',
        options: [
          { text: '₹2,000', isCorrect: false },
          { text: '₹2,100', isCorrect: true },
          { text: '₹2,200', isCorrect: false },
          { text: '₹1,900', isCorrect: false },
        ],
        explanation: 'CI = P[(1+r/100)^n - 1] = 10000[(1.1)² - 1] = 10000[1.21 - 1] = 10000 × 0.21 = ₹2100.',
        marks: 1,
        questionNumber: 9,
      },
      {
        testId: tests[0]._id,
        questionText: 'The ratio of ages of A and B is 3:5. If the sum of their ages is 48, what is the age of B?',
        options: [
          { text: '18', isCorrect: false },
          { text: '24', isCorrect: false },
          { text: '30', isCorrect: true },
          { text: '20', isCorrect: false },
        ],
        explanation: '3x + 5x = 48. 8x = 48. x = 6. Age of B = 5 × 6 = 30.',
        marks: 1,
        questionNumber: 10,
      },
    ];

    // Banking Awareness Questions
    const bankingQuestions = [
      {
        testId: tests[1]._id,
        questionText: 'What does RBI stand for?',
        options: [
          { text: 'Reserve Bank of India', isCorrect: true },
          { text: 'Regional Bank of India', isCorrect: false },
          { text: 'Republic Bank of India', isCorrect: false },
          { text: 'Rural Bank of India', isCorrect: false },
        ],
        explanation: 'RBI stands for Reserve Bank of India, which is the central bank of India.',
        marks: 1,
        questionNumber: 1,
      },
      {
        testId: tests[1]._id,
        questionText: 'What is the full form of NEFT?',
        options: [
          { text: 'National Electronic Fund Transfer', isCorrect: true },
          { text: 'New Electronic Fund Transfer', isCorrect: false },
          { text: 'National Electronic Finance Transfer', isCorrect: false },
          { text: 'National Express Fund Transfer', isCorrect: false },
        ],
        explanation: 'NEFT stands for National Electronic Fund Transfer.',
        marks: 1,
        questionNumber: 2,
      },
      {
        testId: tests[1]._id,
        questionText: 'Who is the current regulator of the insurance sector in India?',
        options: [
          { text: 'RBI', isCorrect: false },
          { text: 'SEBI', isCorrect: false },
          { text: 'IRDAI', isCorrect: true },
          { text: 'NABARD', isCorrect: false },
        ],
        explanation: 'IRDAI (Insurance Regulatory and Development Authority of India) regulates the insurance sector.',
        marks: 1,
        questionNumber: 3,
      },
      {
        testId: tests[1]._id,
        questionText: 'What is the minimum amount that can be transferred through RTGS?',
        options: [
          { text: '₹1 lakh', isCorrect: false },
          { text: '₹2 lakh', isCorrect: true },
          { text: '₹5 lakh', isCorrect: false },
          { text: '₹50,000', isCorrect: false },
        ],
        explanation: 'The minimum amount for RTGS (Real Time Gross Settlement) transfer is ₹2 lakh.',
        marks: 1,
        questionNumber: 4,
      },
      {
        testId: tests[1]._id,
        questionText: 'SLR stands for:',
        options: [
          { text: 'Standard Liquidity Ratio', isCorrect: false },
          { text: 'Statutory Liquidity Ratio', isCorrect: true },
          { text: 'Standard Lending Rate', isCorrect: false },
          { text: 'Statutory Lending Rate', isCorrect: false },
        ],
        explanation: 'SLR stands for Statutory Liquidity Ratio, which is the minimum percentage of deposits that a bank has to maintain in the form of gold, cash, or other approved securities.',
        marks: 1,
        questionNumber: 5,
      },
      {
        testId: tests[1]._id,
        questionText: 'Which bank is known as the "Banker\'s Bank"?',
        options: [
          { text: 'SBI', isCorrect: false },
          { text: 'PNB', isCorrect: false },
          { text: 'RBI', isCorrect: true },
          { text: 'ICICI', isCorrect: false },
        ],
        explanation: 'RBI is known as the Banker\'s Bank as it acts as the bank for all commercial banks in India.',
        marks: 1,
        questionNumber: 6,
      },
      {
        testId: tests[1]._id,
        questionText: 'What is the full form of KYC?',
        options: [
          { text: 'Know Your Customer', isCorrect: true },
          { text: 'Keep Your Card', isCorrect: false },
          { text: 'Know Your Credit', isCorrect: false },
          { text: 'Key Your Code', isCorrect: false },
        ],
        explanation: 'KYC stands for Know Your Customer, a process of verifying the identity of clients.',
        marks: 1,
        questionNumber: 7,
      },
      {
        testId: tests[1]._id,
        questionText: 'NABARD is associated with the development of which sector?',
        options: [
          { text: 'Industrial', isCorrect: false },
          { text: 'Agricultural and Rural', isCorrect: true },
          { text: 'Technology', isCorrect: false },
          { text: 'Defense', isCorrect: false },
        ],
        explanation: 'NABARD (National Bank for Agriculture and Rural Development) focuses on agricultural and rural development.',
        marks: 1,
        questionNumber: 8,
      },
      {
        testId: tests[1]._id,
        questionText: 'What does ATM stand for?',
        options: [
          { text: 'Automatic Teller Machine', isCorrect: false },
          { text: 'Automated Teller Machine', isCorrect: true },
          { text: 'Any Time Money', isCorrect: false },
          { text: 'Automated Transaction Machine', isCorrect: false },
        ],
        explanation: 'ATM stands for Automated Teller Machine.',
        marks: 1,
        questionNumber: 9,
      },
      {
        testId: tests[1]._id,
        questionText: 'The headquarters of RBI is located in:',
        options: [
          { text: 'New Delhi', isCorrect: false },
          { text: 'Kolkata', isCorrect: false },
          { text: 'Mumbai', isCorrect: true },
          { text: 'Chennai', isCorrect: false },
        ],
        explanation: 'The headquarters of the Reserve Bank of India is located in Mumbai, Maharashtra.',
        marks: 1,
        questionNumber: 10,
      },
    ];

    // Railway GK Questions
    const railwayQuestions = [
      {
        testId: tests[2]._id,
        questionText: 'Which planet is known as the "Red Planet"?',
        options: [
          { text: 'Venus', isCorrect: false },
          { text: 'Mars', isCorrect: true },
          { text: 'Jupiter', isCorrect: false },
          { text: 'Saturn', isCorrect: false },
        ],
        explanation: 'Mars is known as the Red Planet due to the iron oxide (rust) on its surface giving it a reddish appearance.',
        marks: 1,
        questionNumber: 1,
      },
      {
        testId: tests[2]._id,
        questionText: 'Who wrote the Indian National Anthem?',
        options: [
          { text: 'Bankim Chandra Chatterjee', isCorrect: false },
          { text: 'Rabindranath Tagore', isCorrect: true },
          { text: 'Mahatma Gandhi', isCorrect: false },
          { text: 'Sarojini Naidu', isCorrect: false },
        ],
        explanation: 'Jana Gana Mana, the Indian National Anthem, was written by Rabindranath Tagore.',
        marks: 1,
        questionNumber: 2,
      },
      {
        testId: tests[2]._id,
        questionText: 'What is the chemical symbol for water?',
        options: [
          { text: 'HO', isCorrect: false },
          { text: 'H2O', isCorrect: true },
          { text: 'OH2', isCorrect: false },
          { text: 'O2H', isCorrect: false },
        ],
        explanation: 'Water has the chemical formula H2O, consisting of two hydrogen atoms and one oxygen atom.',
        marks: 1,
        questionNumber: 3,
      },
      {
        testId: tests[2]._id,
        questionText: 'The longest river in India is:',
        options: [
          { text: 'Yamuna', isCorrect: false },
          { text: 'Godavari', isCorrect: false },
          { text: 'Ganga', isCorrect: true },
          { text: 'Narmada', isCorrect: false },
        ],
        explanation: 'The Ganga (Ganges) is the longest river in India, flowing approximately 2,525 km.',
        marks: 1,
        questionNumber: 4,
      },
      {
        testId: tests[2]._id,
        questionText: 'First railway line in India was laid between:',
        options: [
          { text: 'Delhi to Agra', isCorrect: false },
          { text: 'Bombay to Thane', isCorrect: true },
          { text: 'Calcutta to Delhi', isCorrect: false },
          { text: 'Madras to Bangalore', isCorrect: false },
        ],
        explanation: 'The first railway line in India was laid between Bombay (Mumbai) and Thane on 16 April 1853.',
        marks: 1,
        questionNumber: 5,
      },
      {
        testId: tests[2]._id,
        questionText: 'What is the boiling point of water in Celsius?',
        options: [
          { text: '90°C', isCorrect: false },
          { text: '100°C', isCorrect: true },
          { text: '110°C', isCorrect: false },
          { text: '80°C', isCorrect: false },
        ],
        explanation: 'Water boils at 100°C (212°F) at standard atmospheric pressure.',
        marks: 1,
        questionNumber: 6,
      },
      {
        testId: tests[2]._id,
        questionText: 'Which vitamin is obtained from sunlight?',
        options: [
          { text: 'Vitamin A', isCorrect: false },
          { text: 'Vitamin B', isCorrect: false },
          { text: 'Vitamin C', isCorrect: false },
          { text: 'Vitamin D', isCorrect: true },
        ],
        explanation: 'Vitamin D is synthesized in the skin when exposed to sunlight (UV-B radiation).',
        marks: 1,
        questionNumber: 7,
      },
      {
        testId: tests[2]._id,
        questionText: 'Who is the Father of the Indian Constitution?',
        options: [
          { text: 'Mahatma Gandhi', isCorrect: false },
          { text: 'Jawaharlal Nehru', isCorrect: false },
          { text: 'B.R. Ambedkar', isCorrect: true },
          { text: 'Sardar Patel', isCorrect: false },
        ],
        explanation: 'Dr. B.R. Ambedkar is regarded as the Father of the Indian Constitution as he was the Chairman of the Drafting Committee.',
        marks: 1,
        questionNumber: 8,
      },
      {
        testId: tests[2]._id,
        questionText: 'How many states are there in India (as of 2024)?',
        options: [
          { text: '28', isCorrect: true },
          { text: '29', isCorrect: false },
          { text: '30', isCorrect: false },
          { text: '27', isCorrect: false },
        ],
        explanation: 'India has 28 states and 8 Union Territories as of 2024.',
        marks: 1,
        questionNumber: 9,
      },
      {
        testId: tests[2]._id,
        questionText: 'The national bird of India is:',
        options: [
          { text: 'Sparrow', isCorrect: false },
          { text: 'Parrot', isCorrect: false },
          { text: 'Peacock', isCorrect: true },
          { text: 'Eagle', isCorrect: false },
        ],
        explanation: 'The Indian Peacock (Pavo cristatus) is the national bird of India.',
        marks: 1,
        questionNumber: 10,
      },
    ];

    // MPSC Polity Questions
    const mpscQuestions = [
      {
        testId: tests[3]._id,
        questionText: 'Which Article of the Indian Constitution deals with the Right to Equality?',
        options: [
          { text: 'Article 12', isCorrect: false },
          { text: 'Article 14', isCorrect: true },
          { text: 'Article 19', isCorrect: false },
          { text: 'Article 21', isCorrect: false },
        ],
        explanation: 'Article 14 guarantees equality before the law and equal protection of laws to all persons within India.',
        marks: 1,
        questionNumber: 1,
      },
      {
        testId: tests[3]._id,
        questionText: 'The Preamble of the Indian Constitution was amended by which Constitutional Amendment?',
        options: [
          { text: '42nd Amendment', isCorrect: true },
          { text: '44th Amendment', isCorrect: false },
          { text: '73rd Amendment', isCorrect: false },
          { text: '86th Amendment', isCorrect: false },
        ],
        explanation: 'The 42nd Amendment (1976) added the words "Socialist", "Secular", and "Integrity" to the Preamble.',
        marks: 1,
        questionNumber: 2,
      },
      {
        testId: tests[3]._id,
        questionText: 'Who has the power to declare a Financial Emergency in India?',
        options: [
          { text: 'Prime Minister', isCorrect: false },
          { text: 'President', isCorrect: true },
          { text: 'Finance Minister', isCorrect: false },
          { text: 'RBI Governor', isCorrect: false },
        ],
        explanation: 'Under Article 360, the President of India can declare a Financial Emergency.',
        marks: 1,
        questionNumber: 3,
      },
      {
        testId: tests[3]._id,
        questionText: 'The concept of Directive Principles of State Policy was borrowed from which country\'s Constitution?',
        options: [
          { text: 'USA', isCorrect: false },
          { text: 'UK', isCorrect: false },
          { text: 'Ireland', isCorrect: true },
          { text: 'Canada', isCorrect: false },
        ],
        explanation: 'The Directive Principles of State Policy were borrowed from the Irish Constitution.',
        marks: 1,
        questionNumber: 4,
      },
      {
        testId: tests[3]._id,
        questionText: 'What is the minimum age for becoming a member of Rajya Sabha?',
        options: [
          { text: '25 years', isCorrect: false },
          { text: '30 years', isCorrect: true },
          { text: '35 years', isCorrect: false },
          { text: '21 years', isCorrect: false },
        ],
        explanation: 'The minimum age to become a member of Rajya Sabha is 30 years.',
        marks: 1,
        questionNumber: 5,
      },
      {
        testId: tests[3]._id,
        questionText: 'Which Schedule of the Indian Constitution deals with the distribution of powers between the Union and the States?',
        options: [
          { text: 'Fifth Schedule', isCorrect: false },
          { text: 'Sixth Schedule', isCorrect: false },
          { text: 'Seventh Schedule', isCorrect: true },
          { text: 'Eighth Schedule', isCorrect: false },
        ],
        explanation: 'The Seventh Schedule contains three lists: Union List, State List, and Concurrent List.',
        marks: 1,
        questionNumber: 6,
      },
      {
        testId: tests[3]._id,
        questionText: 'Article 370 was related to which state?',
        options: [
          { text: 'Punjab', isCorrect: false },
          { text: 'Jammu & Kashmir', isCorrect: true },
          { text: 'Sikkim', isCorrect: false },
          { text: 'Nagaland', isCorrect: false },
        ],
        explanation: 'Article 370 provided special autonomous status to Jammu & Kashmir. It was abrogated in August 2019.',
        marks: 1,
        questionNumber: 7,
      },
      {
        testId: tests[3]._id,
        questionText: 'The Chief Justice of India is appointed by:',
        options: [
          { text: 'Parliament', isCorrect: false },
          { text: 'Prime Minister', isCorrect: false },
          { text: 'President', isCorrect: true },
          { text: 'Law Minister', isCorrect: false },
        ],
        explanation: 'The Chief Justice of India is appointed by the President of India.',
        marks: 1,
        questionNumber: 8,
      },
      {
        testId: tests[3]._id,
        questionText: 'Which body conducts elections in India?',
        options: [
          { text: 'Supreme Court', isCorrect: false },
          { text: 'Election Commission of India', isCorrect: true },
          { text: 'Parliament', isCorrect: false },
          { text: 'Home Ministry', isCorrect: false },
        ],
        explanation: 'The Election Commission of India (ECI) is responsible for conducting elections in India (Article 324).',
        marks: 1,
        questionNumber: 9,
      },
      {
        testId: tests[3]._id,
        questionText: 'The Right to Education (Article 21A) was added by which Constitutional Amendment?',
        options: [
          { text: '44th Amendment', isCorrect: false },
          { text: '73rd Amendment', isCorrect: false },
          { text: '86th Amendment', isCorrect: true },
          { text: '91st Amendment', isCorrect: false },
        ],
        explanation: 'The 86th Amendment (2002) inserted Article 21A, making education a fundamental right for children aged 6-14.',
        marks: 1,
        questionNumber: 10,
      },
    ];

    // UPSC Indian History Questions
    const upscQuestions = [
      {
        testId: tests[4]._id,
        questionText: 'The Indus Valley Civilization was discovered in which year?',
        options: [
          { text: '1921', isCorrect: true },
          { text: '1935', isCorrect: false },
          { text: '1915', isCorrect: false },
          { text: '1940', isCorrect: false },
        ],
        explanation: 'The Indus Valley Civilization was discovered in 1921 at Harappa by Daya Ram Sahni.',
        marks: 1,
        questionNumber: 1,
      },
      {
        testId: tests[4]._id,
        questionText: 'Who founded the Maurya Empire?',
        options: [
          { text: 'Ashoka', isCorrect: false },
          { text: 'Bindusara', isCorrect: false },
          { text: 'Chandragupta Maurya', isCorrect: true },
          { text: 'Bimbisara', isCorrect: false },
        ],
        explanation: 'Chandragupta Maurya founded the Maurya Empire in 321 BC with the help of Chanakya (Kautilya).',
        marks: 1,
        questionNumber: 2,
      },
      {
        testId: tests[4]._id,
        questionText: 'The Battle of Plassey was fought in which year?',
        options: [
          { text: '1757', isCorrect: true },
          { text: '1764', isCorrect: false },
          { text: '1857', isCorrect: false },
          { text: '1761', isCorrect: false },
        ],
        explanation: 'The Battle of Plassey was fought on June 23, 1757, between the British East India Company and the Nawab of Bengal.',
        marks: 1,
        questionNumber: 3,
      },
      {
        testId: tests[4]._id,
        questionText: 'Who was the first Governor-General of independent India?',
        options: [
          { text: 'Lord Mountbatten', isCorrect: true },
          { text: 'C. Rajagopalachari', isCorrect: false },
          { text: 'Jawaharlal Nehru', isCorrect: false },
          { text: 'Dr. Rajendra Prasad', isCorrect: false },
        ],
        explanation: 'Lord Mountbatten was the first Governor-General of independent India (1947-1948).',
        marks: 1,
        questionNumber: 4,
      },
      {
        testId: tests[4]._id,
        questionText: 'The Quit India Movement was launched in which year?',
        options: [
          { text: '1940', isCorrect: false },
          { text: '1942', isCorrect: true },
          { text: '1944', isCorrect: false },
          { text: '1946', isCorrect: false },
        ],
        explanation: 'The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942, at the Bombay session of the All India Congress Committee.',
        marks: 1,
        questionNumber: 5,
      },
      {
        testId: tests[4]._id,
        questionText: 'Akbar\'s revenue minister was:',
        options: [
          { text: 'Birbal', isCorrect: false },
          { text: 'Tansen', isCorrect: false },
          { text: 'Todar Mal', isCorrect: true },
          { text: 'Abul Fazl', isCorrect: false },
        ],
        explanation: 'Raja Todar Mal was the finance minister of the Mughal Emperor Akbar. He introduced the Dahsala system of land revenue.',
        marks: 1,
        questionNumber: 6,
      },
      {
        testId: tests[4]._id,
        questionText: 'The Jallianwala Bagh massacre took place on:',
        options: [
          { text: 'April 13, 1919', isCorrect: true },
          { text: 'March 13, 1919', isCorrect: false },
          { text: 'April 13, 1920', isCorrect: false },
          { text: 'May 13, 1919', isCorrect: false },
        ],
        explanation: 'The Jallianwala Bagh massacre took place on April 13, 1919, in Amritsar, under the orders of General Dyer.',
        marks: 1,
        questionNumber: 7,
      },
      {
        testId: tests[4]._id,
        questionText: 'Who is known as the "Iron Man of India"?',
        options: [
          { text: 'Subhas Chandra Bose', isCorrect: false },
          { text: 'Bhagat Singh', isCorrect: false },
          { text: 'Sardar Vallabhbhai Patel', isCorrect: true },
          { text: 'Lala Lajpat Rai', isCorrect: false },
        ],
        explanation: 'Sardar Vallabhbhai Patel is known as the Iron Man of India for his role in unifying the princely states.',
        marks: 1,
        questionNumber: 8,
      },
      {
        testId: tests[4]._id,
        questionText: 'The Vedas are written in which language?',
        options: [
          { text: 'Pali', isCorrect: false },
          { text: 'Sanskrit', isCorrect: true },
          { text: 'Prakrit', isCorrect: false },
          { text: 'Hindi', isCorrect: false },
        ],
        explanation: 'The Vedas are written in Vedic Sanskrit, one of the oldest known languages.',
        marks: 1,
        questionNumber: 9,
      },
      {
        testId: tests[4]._id,
        questionText: 'Who started the Bhakti Movement in South India?',
        options: [
          { text: 'Kabir', isCorrect: false },
          { text: 'Ramanuja', isCorrect: true },
          { text: 'Guru Nanak', isCorrect: false },
          { text: 'Shankaracharya', isCorrect: false },
        ],
        explanation: 'Ramanuja is credited with starting the Bhakti Movement in South India during the 12th century.',
        marks: 1,
        questionNumber: 10,
      },
    ];

    // General English Questions
    const englishQuestions = [
      {
        testId: tests[5]._id,
        questionText: 'Choose the correct synonym of "Benevolent":',
        options: [
          { text: 'Cruel', isCorrect: false },
          { text: 'Kind', isCorrect: true },
          { text: 'Angry', isCorrect: false },
          { text: 'Sad', isCorrect: false },
        ],
        explanation: 'Benevolent means well-meaning and kindly. Its synonym is "Kind".',
        marks: 1,
        questionNumber: 1,
      },
      {
        testId: tests[5]._id,
        questionText: 'Choose the correct antonym of "Transparent":',
        options: [
          { text: 'Clear', isCorrect: false },
          { text: 'Obvious', isCorrect: false },
          { text: 'Opaque', isCorrect: true },
          { text: 'Visible', isCorrect: false },
        ],
        explanation: 'Transparent means allowing light to pass through. Its antonym is "Opaque" (not allowing light to pass through).',
        marks: 1,
        questionNumber: 2,
      },
      {
        testId: tests[5]._id,
        questionText: 'Identify the correct sentence:',
        options: [
          { text: 'He don\'t know the answer.', isCorrect: false },
          { text: 'He doesn\'t knows the answer.', isCorrect: false },
          { text: 'He doesn\'t know the answer.', isCorrect: true },
          { text: 'He not know the answer.', isCorrect: false },
        ],
        explanation: 'The correct form uses "doesn\'t" (does not) + base form of the verb "know".',
        marks: 1,
        questionNumber: 3,
      },
      {
        testId: tests[5]._id,
        questionText: 'Choose the correct spelling:',
        options: [
          { text: 'Accomodation', isCorrect: false },
          { text: 'Accommodation', isCorrect: true },
          { text: 'Acomodation', isCorrect: false },
          { text: 'Accomadation', isCorrect: false },
        ],
        explanation: 'The correct spelling is "Accommodation" with double c and double m.',
        marks: 1,
        questionNumber: 4,
      },
      {
        testId: tests[5]._id,
        questionText: 'Fill in the blank: "She has been working here ___ 2015."',
        options: [
          { text: 'for', isCorrect: false },
          { text: 'since', isCorrect: true },
          { text: 'from', isCorrect: false },
          { text: 'by', isCorrect: false },
        ],
        explanation: '"Since" is used with a specific point in time (2015). "For" is used with a duration.',
        marks: 1,
        questionNumber: 5,
      },
      {
        testId: tests[5]._id,
        questionText: 'The idiom "Break the ice" means:',
        options: [
          { text: 'To break something', isCorrect: false },
          { text: 'To start a conversation', isCorrect: true },
          { text: 'To feel cold', isCorrect: false },
          { text: 'To end a relationship', isCorrect: false },
        ],
        explanation: '"Break the ice" means to initiate social interaction or conversation in an awkward situation.',
        marks: 1,
        questionNumber: 6,
      },
      {
        testId: tests[5]._id,
        questionText: 'Choose the correct form: "Each of the boys ___ given a prize."',
        options: [
          { text: 'were', isCorrect: false },
          { text: 'was', isCorrect: true },
          { text: 'are', isCorrect: false },
          { text: 'have been', isCorrect: false },
        ],
        explanation: '"Each" is a singular pronoun, so it takes a singular verb "was".',
        marks: 1,
        questionNumber: 7,
      },
      {
        testId: tests[5]._id,
        questionText: 'The passive voice of "She writes a letter" is:',
        options: [
          { text: 'A letter is written by her.', isCorrect: true },
          { text: 'A letter was written by her.', isCorrect: false },
          { text: 'A letter were written by her.', isCorrect: false },
          { text: 'A letter is being written by her.', isCorrect: false },
        ],
        explanation: 'Simple present passive: Subject + is/am/are + past participle + by + agent.',
        marks: 1,
        questionNumber: 8,
      },
      {
        testId: tests[5]._id,
        questionText: 'Choose the one-word substitute for "One who loves books":',
        options: [
          { text: 'Bibliophobe', isCorrect: false },
          { text: 'Bibliophile', isCorrect: true },
          { text: 'Philatelist', isCorrect: false },
          { text: 'Numismatist', isCorrect: false },
        ],
        explanation: 'A Bibliophile is a person who loves or collects books.',
        marks: 1,
        questionNumber: 9,
      },
      {
        testId: tests[5]._id,
        questionText: 'Choose the correct preposition: "He is fond ___ music."',
        options: [
          { text: 'in', isCorrect: false },
          { text: 'of', isCorrect: true },
          { text: 'at', isCorrect: false },
          { text: 'with', isCorrect: false },
        ],
        explanation: '"Fond of" is the correct prepositional phrase meaning having a liking for something.',
        marks: 1,
        questionNumber: 10,
      },
    ];

    // Insert all questions
    const allQuestions = [
      ...sscQuestions,
      ...bankingQuestions,
      ...railwayQuestions,
      ...mpscQuestions,
      ...upscQuestions,
      ...englishQuestions,
    ];

    await Question.insertMany(allQuestions);
    console.log(`Created ${allQuestions.length} questions (10 per test).`);

    // ========== 4. CREATE SAMPLE COMMUNITY POSTS ==========
    const postsData = [
      {
        author: tushar._id,
        title: 'My SSC CGL Preparation Strategy',
        content:
          'I have been preparing for SSC CGL for the past 6 months. Here is my strategy: 1) Start with NCERT books for basics 2) Practice previous year papers daily 3) Focus on weak areas with targeted tests 4) Maintain a revision schedule. Mock tests on this platform have been incredibly helpful for time management practice!',
      },
      {
        author: priya._id,
        title: 'Best Books for Banking Exams 2024',
        content:
          'Here is my recommended list of books for banking exams: 1) Quantitative Aptitude by R.S. Aggarwal 2) English Language by S.P. Bakshi 3) Banking Awareness by Arihant 4) Reasoning by M.K. Pandey. Combine these with daily newspaper reading and regular mock tests for best results.',
      },
      {
        author: tushar._id,
        title: 'UPSC Prelims: How to Approach CSAT Paper',
        content:
          'CSAT (Paper II) is qualifying in nature. You need 33% to qualify. Focus areas: 1) Reading Comprehension - practice daily passages 2) Basic Mathematics - ratios, percentages, averages 3) Logical Reasoning - syllogisms, analogies 4) Decision Making. Don\'t ignore this paper completely but don\'t over-invest time either.',
      },
      {
        author: priya._id,
        title: 'Tips for Managing Exam Stress',
        content:
          'Competitive exam preparation can be stressful. Here are some tips: 1) Maintain a regular sleep schedule 2) Exercise for at least 30 minutes daily 3) Take short breaks during study sessions (Pomodoro technique works!) 4) Stay connected with friends and family 5) Practice meditation or deep breathing 6) Remember: your worth is not determined by an exam result!',
      },
    ];

    const posts = await Post.create(postsData);
    console.log(`Created ${posts.length} sample community posts.`);

    console.log('\n✅ Seed data created successfully!');
    console.log('Demo Users:');
    console.log('  - tushar@example.com / password123');
    console.log('  - priya@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
