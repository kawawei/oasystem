const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Note, NoteContent } = require('../models');

// 創建筆記本
router.post('/', auth, async (req, res) => {
  try {
    const { title, coverStyle, template, paperColor } = req.body;
    
    const note = await Note.create({
      title,
      coverStyle,
      template,
      paperColor,
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 獲取用戶的所有筆記本
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 獲取單個筆記
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: NoteContent,
        as: 'content',
        where: { pageNumber: 1 },  // 默認獲取第一頁
        required: false
      }]
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '筆記不存在'
      });
    }
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 更新筆記內容
router.put('/:id/content', auth, async (req, res) => {
  try {
    const { content, pageNumber = 1 } = req.body;
    console.log('保存筆記內容:', {
      noteId: req.params.id,
      userId: req.user.id,
      pageNumber,
      contentLength: content?.length
    });
    
    // 檢查筆記是否存在且屬於當前用戶
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: '筆記不存在'
      });
    }

    // 更新或創建內容
    const [noteContent] = await NoteContent.upsert({
      noteId: note.id,
      content,
      pageNumber
    });

    res.json({
      success: true,
      message: '更新成功',
      data: noteContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 獲取指定頁面的內容
router.get('/:id/content/:page', auth, async (req, res) => {
  try {
    const { id, page } = req.params;
    
    const noteContent = await NoteContent.findOne({
      where: {
        noteId: id,
        pageNumber: page
      },
      include: [{
        model: Note,
        as: 'note',
        where: { userId: req.user.id },
        attributes: []
      }]
    });

    res.json({
      success: true,
      data: noteContent || { content: '', pageNumber: parseInt(page) }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 更新筆記本樣式
router.put('/:id', auth, async (req, res) => {
  try {
    const { coverStyle, template, paperColor } = req.body;
    
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: '筆記不存在'
      });
    }

    await note.update({
      coverStyle,
      template,
      paperColor
    });

    res.json({
      success: true,
      message: '更新成功',
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 刪除筆記本
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: '筆記不存在'
      });
    }

    await note.destroy();

    res.json({
      success: true,
      message: '刪除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 