package recipebase.server.item.resource;

import org.jspecify.annotations.Nullable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import recipebase.server.item.FindItemsUseCase;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/items")
public class ItemController {

    private final FindItemsUseCase findItemsUseCase;

    public ItemController(FindItemsUseCase findItemsUseCase) {
        this.findItemsUseCase = findItemsUseCase;
    }

    @GetMapping
    public List<ItemSummaryResource> list(
            @RequestParam @Nullable String q,
            @RequestParam @Nullable String type,
            @RequestParam(required = false) @Nullable List<String> tags) {
        return findItemsUseCase.execute(q, type, tags);
    }
}
