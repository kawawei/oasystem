from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
from typing import Optional, List
from ..models.page import WebPage, PageMetadata
from config.settings import settings

class HTMLParser:
    def parse_html(self, html: str, base_url: str) -> Optional[WebPage]:
        """
        解析HTML內容並返回WebPage對象
        
        Args:
            html: HTML內容
            base_url: 頁面的基礎URL
            
        Returns:
            WebPage對象或None（如果解析失敗）
        """
        try:
            soup = BeautifulSoup(html, 'lxml')
            
            # 移除不需要的標籤
            self._remove_unwanted_tags(soup)
            
            # 提取主要內容
            main_content = self._extract_main_content(soup)
            if not main_content:
                return None
                
            return WebPage(
                url=base_url,
                title=self._get_title(soup),
                content=main_content,
                links=self._get_links(soup, base_url),
                last_updated=datetime.now(),
                metadata=self._get_metadata(soup, base_url)
            )
        except Exception as e:
            print(f"Error parsing {base_url}: {e}")
            return None

    def _remove_unwanted_tags(self, soup: BeautifulSoup) -> None:
        """移除不需要的HTML標籤"""
        for tag in settings.IGNORE_TAGS:
            for element in soup.find_all(tag):
                element.decompose()

    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """
        提取頁面的主要內容
        優先從主要內容標籤中提取，如果沒有找到，則提取所有文本
        """
        # 嘗試從主要內容標籤中提取
        for selector in settings.MAIN_CONTENT_TAGS:
            if '.' in selector:
                tag, class_name = selector.split('.')
                main = soup.find(tag, class_=class_name)
            else:
                main = soup.find(selector)
            
            if main:
                return self._clean_text(main.get_text())
        
        # 如果沒有找到主要內容標籤，提取所有文本
        return self._clean_text(soup.get_text())

    def _clean_text(self, text: str) -> str:
        """清理文本內容，移除多餘的空白字符"""
        lines = (line.strip() for line in text.splitlines())
        return ' '.join(line for line in lines if line)

    def _get_title(self, soup: BeautifulSoup) -> str:
        """
        提取頁面標題
        優先使用 og:title，然後是 title 標籤
        """
        # 嘗試獲取 og:title
        og_title = soup.find('meta', property='og:title')
        if og_title:
            return og_title.get('content', '').strip()
            
        # 使用普通 title 標籤
        title_tag = soup.find('title')
        return title_tag.text.strip() if title_tag else ''

    def _get_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """提取並規範化所有鏈接"""
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            # 規範化URL
            full_url = urljoin(base_url, href)
            if full_url.startswith(('http://', 'https://')):
                links.append(full_url)
        return links

    def _get_metadata(self, soup: BeautifulSoup, base_url: str) -> PageMetadata:
        """提取頁面元數據"""
        return PageMetadata(
            description=self._get_meta_content(soup, 'description'),
            keywords=self._get_keywords(soup),
            favicon=self._get_favicon(soup, base_url),
            language=self._get_language(soup)
        )

    def _get_meta_content(self, soup: BeautifulSoup, name: str) -> str:
        """提取meta標籤內容"""
        # 先檢查 og metadata
        og_meta = soup.find('meta', property=f'og:{name}')
        if og_meta:
            return og_meta.get('content', '')
            
        # 再檢查普通 metadata
        meta = soup.find('meta', {'name': name})
        return meta.get('content', '') if meta else ''

    def _get_keywords(self, soup: BeautifulSoup) -> List[str]:
        """提取關鍵字"""
        keywords = self._get_meta_content(soup, 'keywords')
        return [k.strip() for k in keywords.split(',') if k.strip()]

    def _get_favicon(self, soup: BeautifulSoup, base_url: str) -> str:
        """提取網站圖標"""
        # 檢查多種可能的favicon位置
        for rel in ['icon', 'shortcut icon', 'apple-touch-icon']:
            icon = soup.find('link', rel=rel)
            if icon and icon.get('href'):
                return urljoin(base_url, icon['href'])
        return urljoin(base_url, '/favicon.ico')  # 默認位置

    def _get_language(self, soup: BeautifulSoup) -> str:
        """提取頁面語言"""
        # 檢查html標籤的lang屬性
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            return html_tag['lang']
            
        # 檢查meta標籤
        meta_lang = soup.find('meta', {'http-equiv': 'content-language'})
        if meta_lang:
            return meta_lang.get('content', 'zh-TW')
            
        return 'zh-TW'  # 默認語言
  