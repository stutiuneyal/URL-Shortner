import httpx
from bs4 import BeautifulSoup


async def fetch_page_metadata(url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                "User-Agent": "URL-Shortener-AI/1.0"
            })
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        title = ""
        description = ""

        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            description = meta_desc.get("content").strip()

        og_title = soup.find("meta", attrs={"property": "og:title"})
        if not title and og_title and og_title.get("content"):
            title = og_title.get("content").strip()

        og_desc = soup.find("meta", attrs={"property": "og:description"})
        if not description and og_desc and og_desc.get("content"):
            description = og_desc.get("content").strip()

        return {
            "title": title,
            "description": description
        }
    except Exception:
        return {
            "title": "",
            "description": ""
        }