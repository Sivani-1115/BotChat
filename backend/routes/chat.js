const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['x-auth-token'],
    credentials: true,
  },
});

const router = express.Router();

// Send Message
router.post('/messages', auth, async (req, res) => {
  const { receiver, content } = req.body;
  const message = new Message({ sender: req.user.username, receiver, content });
  await message.save();

  io.to(receiver).emit("message", message);

  let responseContent = null;
  if (content.toLowerCase() === 'hi') {
    responseContent = `Hi, welcome to Bot chatbot!\nChoose a query:\n1. Option a\n2. Option b\n3. Option c\n4. Option d\n5. Raise your own query`;
  } else if (content === '1') {
    responseContent = 'Thanks for selecting option a.';
  } else if (content === '2') {
    responseContent = 'Thanks for selecting option b.';
  } else if (content === '3') {
    responseContent = 'Thanks for selecting option c.';
  } else if (content === '4') {
    responseContent = 'Thanks for selecting option d.';
  } else if (content === '5') {
    responseContent = 'Please enter your query:';
    io.to(receiver).emit("openQueryBox");
  }
  else {
    responseContent === 'Choose a query:\n1. Option a\n2. Option b\n3. Option c\n4. Option d\n5. Raise your own query';
  }

  if (responseContent) {
    const botMessage = new Message({
      sender: 'ChatBot',
      receiver: req.user.username,
      content: responseContent,
    });
    await botMessage.save();
    io.emit('message', botMessage);
  } else if (content.startsWith('QUERY: ')) {
    const queryNumber = Math.floor(Math.random() * 1000000);
    const botMessage = new Message({
      sender: 'ChatBot',
      receiver: req.user.username,
      content: `Thank you for your query. Your ticket number is ${queryNumber}. We will get back to you soon.`,
    });
    await botMessage.save();
    io.emit('message', botMessage);
  }

  res.send(message);
});

// Get Messages
router.get('/messages', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user.username }, { receiver: req.user.username }],
  });
  res.send(messages);
});

module.exports = router;
