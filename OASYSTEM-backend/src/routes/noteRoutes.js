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
    // 先獲取筆記本基本信息
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '找不到筆記'
      });
    }

    // 單獨獲取最新的內容
    const noteContent = await NoteContent.findOne({
      where: {
        noteId: note.id,
        pageNumber: 1
      },
      order: [['updatedAt', 'DESC']] // 確保獲取最新的內容
    });

    // 構建返回數據
    const responseData = {
      ...note.toJSON(),
      content: noteContent || { content: '', pageNumber: 1 }
    };
    
    console.log('Sending note data:', responseData);
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching note:', error);
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
    const [noteContent, created] = await NoteContent.upsert({
      noteId: note.id,
      content: content || '', // 確保 content 不為 undefined
      pageNumber: pageNumber
    }, {
      returning: true // 返回更新後的數據
    });

    // 更新筆記的更新時間
    await note.update({ updatedAt: new Date() });

    console.log('Content saved:', {
      noteId: note.id,
      content: content,
      pageNumber: pageNumber,
      created: created
    });

    // 保存後立即查詢最新內容進行驗證
    const verifyContent = await NoteContent.findOne({
      where: {
        noteId: note.id,
        pageNumber: pageNumber
      },
      order: [['updatedAt', 'DESC']]
    });

    console.log('Verified saved content:', verifyContent);

    res.json({
      success: true,
      message: created ? '創建成功' : '更新成功',
      data: verifyContent
    });
  } catch (error) {
    console.error('Save content error:', error);
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

// 更新筆記本樣題
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, coverStyle, template, paperColor } = req.body;
    console.log('Update note request:', { title, coverStyle, template, paperColor });
    
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

    // 只更新提供的字段
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (coverStyle !== undefined) updateData.coverStyle = coverStyle;
    if (template !== undefined) updateData.template = template;
    if (paperColor !== undefined) updateData.paperColor = paperColor;

    await note.update(updateData);

    console.log('Note updated:', {
      id: note.id,
      ...updateData
    });

    res.json({
      success: true,
      message: '更新成功',
      data: await note.reload() // 返回更新後的完整數據
    });
  } catch (error) {
    console.error('Update note error:', error);
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

// 獲取筆記內容
router.get('/:id/content', auth, async (req, res) => {
  try {
    const { pageNumber = 1 } = req.query;
    
    const content = await NoteContent.findOne({
      where: {
        noteId: req.params.id,
        pageNumber: pageNumber
      }
    });

    if (!content) {
      return res.json({
        success: true,
        data: { content: '', pageNumber }
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get note content error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 獲取筆記總頁數
router.get('/:id/pages/count', auth, async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // 從數據庫中獲取該筆記的所有內容
    const contents = await NoteContent.findAll({
      where: {
        noteId: noteId
      }
    });
    
    // 返回內容的數量作為頁數
    res.json({
      success: true,
      data: contents.length || 1  // 如果沒有內容，返回1作為默認頁數
    });
  } catch (error) {
    console.error('Error getting pages count:', error);
    res.status(500).json({
      success: false,
      message: '獲取頁數失敗'
    });
  }
});

module.exports = router; 