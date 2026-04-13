import os
import glob

html_files = glob.glob('*.html')

brand_hex_tracker = '<a href="index.html" class="nav-brand" style="text-decoration:none;"><div class="brand-hex">⬡</div><div><div class="brand-name">CompanyConnect</div><div class="brand-sub">Infosys Springboard Tracker</div></div></a>'
brand_hex_tracker_new = '<a href="index.html" class="nav-brand" style="text-decoration:none;"><img src="logo.jpeg" alt="StudentsConnect Logo" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; margin-right: 8px;"><div><div class="brand-name">CompanyConnect</div><div class="brand-sub">Infosys Springboard Tracker</div></div></a>'

brand_hex_admin = '<a href="index.html" class="nav-brand" style="text-decoration:none;"><div class="brand-hex">⬡</div><div><div class="brand-name">CompanyConnect</div><div class="brand-sub">Admin Panel</div></div></a>'
brand_hex_admin_new = '<a href="index.html" class="nav-brand" style="text-decoration:none;"><img src="logo.jpeg" alt="StudentsConnect Logo" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; margin-right: 8px;"><div><div class="brand-name">CompanyConnect</div><div class="brand-sub">Admin Panel</div></div></a>'

auth_hex = '<div class="auth-logo-hex">⬡</div>'
auth_hex_new = '<img src="logo.jpeg" alt="StudentsConnect Logo" style="width: 40px; height: 40px; border-radius: 10px; object-fit: cover;">'

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace(brand_hex_tracker, brand_hex_tracker_new)
    new_content = new_content.replace(brand_hex_admin, brand_hex_admin_new)
    new_content = new_content.replace(auth_hex, auth_hex_new)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
print("Done")
