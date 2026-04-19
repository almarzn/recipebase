## Items

```
item
  id
  slug
  type              recipe | assembly
  name
  tags              []
  created_at
  updated_at
```

---

## Recipe

```
recipe
  id
  item_id

  source
    type            url | book | original
    url
    reference

  yield
    quantity
    unit
    description

  components        []       (every recipe has at least one, unnamed by default)
    id
    slug
    name             (nullable — only needed if recipe has multiple components)
    position

    ingredients      []
      id
      slug
      name
      quantity       (jsonb — {value, unit})
      notes
      position

  steps             []
    id
    slug
    order
    body
    timer_seconds

  notes             text
```

---

## Assembly

```
assembly
  id
  item_id

  yield
    quantity
    unit
    description

  components        []
    id
    slug
    order
    item_id
    scale_factor
    locked          bool
    lock_snapshot
```
