import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, productId } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      product: productId || null,
    });

    const createdMessage = await message.save();
    
    // Populate sender info before returning
    await createdMessage.populate('sender', 'name email isAgent');
    if (createdMessage.product) {
      await createdMessage.populate('product', 'name image price');
    }
    
    res.status(201).json(createdMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// @desc    Get all conversations (unique users)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email isAgent')
      .populate('receiver', 'name email isAgent');

    // Extract unique conversations
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      // Determine who the *other* person is
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      
      const otherUserId = otherUser._id.toString();
      
      // If we haven't added this person yet, add them (since messages are sorted, this is the most recent message)
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: msg.receiver._id.toString() === userId.toString() && !msg.isRead ? 1 : 0
        });
      } else {
        // Just accumulate unread count
        if (msg.receiver._id.toString() === userId.toString() && !msg.isRead) {
          const current = conversationsMap.get(otherUserId);
          current.unreadCount += 1;
          conversationsMap.set(otherUserId, current);
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .populate('product', 'name image price');

    // Mark received messages as read
    const unreadMessageIds = messages
      .filter((m) => m.receiver._id.toString() === userId.toString() && !m.isRead)
      .map((m) => m._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $set: { isRead: true } }
      );
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

// @desc    Delete a conversation with a user
// @route   DELETE /api/messages/:userId
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
  }
};
