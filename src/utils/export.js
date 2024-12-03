import { utils, writeFile } from 'xlsx'

export const exportToExcel = (data, filename) => {
  const workbook = utils.book_new()
  
  data.forEach(sheet => {
    const worksheet = utils.aoa_to_sheet(sheet.data)
    utils.book_append_sheet(workbook, worksheet, sheet.sheetName)
  })
  
  writeFile(workbook, `${filename}.xlsx`)
} 