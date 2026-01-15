"""用户自定义模板管理服务"""
import json
import uuid
import time
from pathlib import Path
from typing import Optional, List

from models.schemas import UserTemplate, CreateTemplateRequest
from config import settings


class TemplateService:
    """模板管理服务"""

    def __init__(self):
        self.templates_file = settings.TEMPLATES_FILE
        self._ensure_templates_file()

    def _ensure_templates_file(self):
        """确保模板文件存在"""
        if not self.templates_file.exists():
            self.templates_file.parent.mkdir(parents=True, exist_ok=True)
            self.templates_file.write_text('{"templates": []}', encoding='utf-8')

    def _load_templates(self) -> List[dict]:
        """从文件加载模板"""
        try:
            data = json.loads(self.templates_file.read_text(encoding='utf-8'))
            return data.get('templates', [])
        except Exception:
            return []

    def _save_templates(self, templates: List[dict]):
        """保存模板到文件"""
        data = {"templates": templates}
        self.templates_file.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )

    def create_template(self, request: CreateTemplateRequest) -> UserTemplate:
        """创建新模板"""
        templates = self._load_templates()

        # 生成唯一 ID
        template_id = str(uuid.uuid4())[:8]
        now = time.time()

        new_template = UserTemplate(
            id=template_id,
            name=request.name,
            prompt=request.prompt,
            prompt_only=request.prompt_only,
            text_content=request.text_content,
            created_at=now,
            updated_at=now
        )

        templates.append(new_template.model_dump())
        self._save_templates(templates)

        return new_template

    def get_templates(self) -> List[UserTemplate]:
        """获取所有模板"""
        templates = self._load_templates()
        return [UserTemplate(**t) for t in templates]

    def get_template(self, template_id: str) -> Optional[UserTemplate]:
        """获取单个模板"""
        templates = self._load_templates()
        for t in templates:
            if t['id'] == template_id:
                return UserTemplate(**t)
        return None

    def update_template(self, template_id: str, name: str, prompt: str) -> Optional[UserTemplate]:
        """更新模板"""
        templates = self._load_templates()
        for i, t in enumerate(templates):
            if t['id'] == template_id:
                if name:
                    t['name'] = name
                if prompt:
                    t['prompt'] = prompt
                t['updated_at'] = time.time()

                templates[i] = t
                self._save_templates(templates)
                return UserTemplate(**t)
        return None

    def delete_template(self, template_id: str) -> bool:
        """删除模板"""
        templates = self._load_templates()
        original_length = len(templates)
        templates = [t for t in templates if t['id'] != template_id]

        if len(templates) < original_length:
            self._save_templates(templates)
            return True
        return False
