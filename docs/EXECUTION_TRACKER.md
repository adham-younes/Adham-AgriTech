# Execution Tracker

## Operating Cycle (Mandatory)
لكل دفعة عمل نلتزم بالتسلسل التالي:

1. **Plan**: تحديد أهداف الدفعة، نطاقها، ومعايير الإغلاق.
2. **Implement**: تنفيذ تغييرات صغيرة قابلة للدمج.
3. **Validate**: تشغيل `lint` ثم `typecheck` ثم `test` قبل الإغلاق.
4. **Commit**: إنشاء commit صغير وواضح يصف مخرجات الدفعة.
5. **PR Notes**: تحديث ملاحظات الـ PR وسجل التنفيذ.

## Batch Size
- حجم كل دفعة: **60–90 دقيقة**.
- كل دفعة يجب أن تنتج **مخرجات قابلة للدمج (mergeable)**.

## Auto-Iteration Rule
- نكرر الدفعات تلقائياً بنفس الدورة حتى:
  - إنهاء كامل المحاور، أو
  - بلوغ حد زمني متفق عليه.

## Current Axes
- [ ] Axis 1: تحسين تشغيل الدفعات والانضباط التشغيلي.
- [ ] Axis 2: تنفيذ محاور المنتج/الهندسة التالية (يتم تعبئتها حسب الخطة).

---

## Batch Log

### Wave 1
**Window target:** 60–90 minutes  
**Goal(s):**
- [x] تثبيت دورة التشغيل الرسمية داخل المستودع.
- [x] إضافة ملف تتبع تنفيذ مركزي.
- [x] تعريف حجم الدفعة وقاعدة التكرار.

**Task status:**
| Task | Status |
|---|---|
| إنشاء `docs/EXECUTION_TRACKER.md` | done |
| توثيق دورة Plan → Implement → Validate → Commit → PR Notes | done |
| توثيق شرط تشغيل lint/typecheck/test لكل دفعة | done |
| توثيق حجم الدفعة (60–90 دقيقة) ومخرجات mergeable | done |
| توثيق قاعدة التكرار التلقائي حتى إنهاء المحاور/الحد الزمني | done |

**Risks / Blockers:**
- لا توجد عوائق تقنية حالياً.
- خطر تشغيلي: غياب تعريف تفصيلي للمحاور القادمة قد يؤخر تحديد أولويات Wave 2.

**Validation checklist (before close):**
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm test`

**Commit (end of wave):**
- Completed in this wave (see commit history).

