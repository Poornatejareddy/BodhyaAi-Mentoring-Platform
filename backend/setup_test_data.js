const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Mentor = require('./src/models/Mentor');

dotenv.config({ path: './.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Create Mentor
        const mentorUser = await User.create({
            name: 'Test Mentor',
            email: 'mentor@test.com',
            password: 'password123',
            role: 'mentor'
        });

        const mentorProfile = await Mentor.create({
            user: mentorUser._id,
            department: 'CSE',
            specialization: ['AI', 'ML']
        });

        console.log('Mentor created:', mentorUser.email);

        // 2. Create Student (Manikanta)
        const studentUser = await User.create({
            name: 'Manikanta',
            email: 'manikanta@test.com',
            password: 'password123',
            role: 'student'
        });

        const studentProfile = await Student.create({
            user: studentUser._id,
            name: 'Manikanta',
            usn: '1MS21CS001',
            department: 'CSE',
            section: 'A',
            riskInputs: {
                CGPA: 6.5,
                Attendance: 75,
                Backlogs: 2,
                StressScore: 8
            },
            academicRisk: {
                prediction: 'HIGH',
                insights: ['Struggling with consistent attendance', 'High stress levels detected'],
                warnings: ['Risk of detention due to attendance', 'CGPA dropped below 7.0']
            },
            mentor: mentorProfile._id
        });

        console.log('Student created:', studentUser.name);

        // 3. Link Student to Mentor
        mentorProfile.mentees.push(studentProfile._id);
        await mentorProfile.save();
        console.log('Linked student to mentor');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
