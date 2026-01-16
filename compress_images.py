#!/usr/bin/env python3
"""
图片压缩脚本
用于批量压缩封面图片，减少文件体积
"""

from PIL import Image
import os
import sys

def compress_images(quality=80, max_width=300, output_dir='compressed'):
    """
    压缩图片
    
    参数:
        quality: JPEG质量 (1-100, 推荐80)
        max_width: 最大宽度 (像素)
        output_dir: 输出目录
    """
    # 创建输出目录
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 支持的图片格式
    image_extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
    
    # 查找所有图片文件
    image_files = [f for f in os.listdir('.') 
                   if f.endswith(image_extensions) 
                   and not f.startswith('compressed_')]
    
    if not image_files:
        print("未找到图片文件！")
        return
    
    print(f"找到 {len(image_files)} 张图片，开始压缩...")
    print(f"参数: 质量={quality}%, 最大宽度={max_width}px\n")
    
    total_original = 0
    total_compressed = 0
    
    for filename in image_files:
        try:
            # 打开图片
            img = Image.open(filename)
            original_size = os.path.getsize(filename)
            total_original += original_size
            
            # 计算新尺寸（保持宽高比）
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                # 兼容旧版本PIL
                try:
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                except AttributeError:
                    img = img.resize((max_width, new_height), Image.LANCZOS)
            
            # 转换为RGB（如果是RGBA）
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # 保存压缩后的图片
            output_path = os.path.join(output_dir, filename)
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            compressed_size = os.path.getsize(output_path)
            total_compressed += compressed_size
            
            # 计算压缩率
            reduction = (1 - compressed_size / original_size) * 100
            
            print(f"✓ {filename}")
            print(f"  {original_size/1024:.1f}KB -> {compressed_size/1024:.1f}KB (减少 {reduction:.1f}%)")
            
        except Exception as e:
            print(f"✗ {filename}: 错误 - {e}")
    
    # 总结
    print(f"\n{'='*50}")
    print(f"总计: {total_original/1024:.1f}KB -> {total_compressed/1024:.1f}KB")
    print(f"总压缩率: {(1 - total_compressed/total_original)*100:.1f}%")
    print(f"节省空间: {(total_original - total_compressed)/1024:.1f}KB")
    print(f"\n压缩后的图片保存在 '{output_dir}' 目录")
    print("请检查效果后替换原图！")

if __name__ == '__main__':
    # 默认参数
    quality = 80
    max_width = 300
    
    # 从命令行参数读取
    if len(sys.argv) > 1:
        quality = int(sys.argv[1])
    if len(sys.argv) > 2:
        max_width = int(sys.argv[2])
    
    print("="*50)
    print("图片压缩工具")
    print("="*50)
    compress_images(quality=quality, max_width=max_width)
