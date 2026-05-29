file_path = r"c:\Users\Pranav\Desktop\QuizApp\frontend\src\student\StudentProfile.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Change text-[13px] font-bold to text-[13px] font-semibold in MobileSettingsPage header
target1 = '<h3 className={`text-[13px] font-bold ${isDark ? \'text-white\' : \'text-slate-900\'} font-display`}>{selectedGoal}</h3>'
replace1 = '<h3 className={`text-[13px] font-semibold ${isDark ? \'text-white\' : \'text-slate-900\'} font-display`}>{selectedGoal}</h3>'

if target1 in content:
    content = content.replace(target1, replace1)
    print("Replaced target1 successfully!")
else:
    print("WARNING: target1 NOT found!")

# 2. Change text-[13px] font-bold to text-[13px] font-semibold in MobileSettingsPage dropdown
target2 = '<span className={`text-[13px] font-bold font-display ${isDark ? \'text-white\' : \'text-slate-905\'}`}>{goal}</span>'
replace2 = '<span className={`text-[13px] font-semibold font-display ${isDark ? \'text-white\' : \'text-slate-905\'}`}>{goal}</span>'

if target2 in content:
    content = content.replace(target2, replace2)
    print("Replaced target2 successfully!")
else:
    # try settings layout version (slate-900 instead of slate-905)
    target2_alt = '<span className={`text-[13px] font-bold font-display ${isDark ? \'text-white\' : \'text-slate-900\'}`}>{goal}</span>'
    replace2_alt = '<span className={`text-[13px] font-semibold font-display ${isDark ? \'text-white\' : \'text-slate-900\'}`}>{goal}</span>'
    if target2_alt in content:
        content = content.replace(target2_alt, replace2_alt)
        print("Replaced target2 alt successfully!")
    else:
        print("WARNING: target2 NOT found!")

# 3. Change text-[14px] font-extrabold to text-[14px] font-semibold in main mobile header
target3 = '<span className={`text-[14px] font-extrabold font-display ${isDark ? \'text-white\' : \'text-slate-900\'}}`>'
# Wait, let's look at lines 1058-1065 of StudentProfile.jsx to make sure we match it exactly
# Line 1060 is: <span className={`text-[14px] font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
# Let's do a substring replace of just: className={`text-[14px] font-extrabold font-display
target3 = 'className={`text-[14px] font-extrabold font-display'
replace3 = 'className={`text-[14px] font-semibold font-display'

if target3 in content:
    content = content.replace(target3, replace3)
    print("Replaced target3 successfully!")
else:
    print("WARNING: target3 NOT found!")

# 4. Change main mobile dropdown font-bold to font-semibold
# Let's check line 1095 in the view output:
# ${isDark ? 'hover:bg-slate-800/40 text-white' : 'hover:bg-slate-50 text-slate-808'}
# and line 1102: <span className={`text-[13px] font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>{goal}</span>
# Wait! In new_main_mobile_header in edit_profile.py we wrote:
# text-slate-808 (which got compiled but had a typo) and text-slate-905!
# Let's check what is in the file.
# Line 1095 has: 'hover:bg-slate-50 text-slate-808'
# Line 1102 has: <span className={`text-[13px] font-bold font-display ${isDark ? 'text-white' : 'text-slate-905'}`}>{goal}</span>
target4 = '<span className={`text-[13px] font-bold font-display ${isDark ? \'text-white\' : \'text-slate-905\'}`}>{goal}</span>'
replace4 = '<span className={`text-[13px] font-semibold font-display ${isDark ? \'text-white\' : \'text-slate-905\'}`}>{goal}</span>'

if target4 in content:
    content = content.replace(target4, replace4)
    print("Replaced target4 successfully!")
else:
    # try alt version
    target4_alt = '<span className={`text-[13px] font-bold font-display ${isDark ? \'text-white\' : \'text-slate-900\'}`}>{goal}</span>'
    replace4_alt = '<span className={`text-[13px] font-semibold font-display ${isDark ? \'text-white\' : \'text-slate-900\'}`}>{goal}</span>'
    if target4_alt in content:
        content = content.replace(target4_alt, replace4_alt)
        print("Replaced target4 alt successfully!")
    else:
        print("WARNING: target4 NOT found!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modification successfully completed!")
