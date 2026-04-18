package recipebase.server.assembly.resource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import recipebase.server.assembly.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/assemblies")
public class AssemblyController {

    private final CreateAssemblyUseCase createAssemblyUseCase;
    private final FindAssemblyBySlugUseCase findAssemblyBySlugUseCase;
    private final UpdateAssemblyUseCase updateAssemblyUseCase;
    private final DeleteAssemblyUseCase deleteAssemblyUseCase;
    private final AddAssemblyComponentUseCase addAssemblyComponentUseCase;
    private final UpdateAssemblyComponentUseCase updateAssemblyComponentUseCase;
    private final DeleteAssemblyComponentUseCase deleteAssemblyComponentUseCase;

    public AssemblyController(
            CreateAssemblyUseCase createAssemblyUseCase,
            FindAssemblyBySlugUseCase findAssemblyBySlugUseCase,
            UpdateAssemblyUseCase updateAssemblyUseCase,
            DeleteAssemblyUseCase deleteAssemblyUseCase,
            AddAssemblyComponentUseCase addAssemblyComponentUseCase,
            UpdateAssemblyComponentUseCase updateAssemblyComponentUseCase,
            DeleteAssemblyComponentUseCase deleteAssemblyComponentUseCase) {
        this.createAssemblyUseCase = createAssemblyUseCase;
        this.findAssemblyBySlugUseCase = findAssemblyBySlugUseCase;
        this.updateAssemblyUseCase = updateAssemblyUseCase;
        this.deleteAssemblyUseCase = deleteAssemblyUseCase;
        this.addAssemblyComponentUseCase = addAssemblyComponentUseCase;
        this.updateAssemblyComponentUseCase = updateAssemblyComponentUseCase;
        this.deleteAssemblyComponentUseCase = deleteAssemblyComponentUseCase;
    }

    @PostMapping
    public ResponseEntity<AssemblyResource> create(@RequestBody CreateAssemblyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(createAssemblyUseCase.execute(request));
    }

    @GetMapping("{slug}")
    public ResponseEntity<AssemblyResource> findBySlug(@PathVariable String slug) {
        return ResponseEntity.of(findAssemblyBySlugUseCase.execute(slug));
    }

    @GetMapping("{slug}/components")
    public ResponseEntity<List<AssemblyComponentResource>> findComponents(@PathVariable String slug) {
        return findAssemblyBySlugUseCase.execute(slug)
            .map(a -> ResponseEntity.ok(a.components()))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}")
    public ResponseEntity<AssemblyResource> update(
            @PathVariable String slug,
            @RequestBody UpdateAssemblyRequest request) {
        return ResponseEntity.of(updateAssemblyUseCase.execute(slug, request));
    }

    @DeleteMapping("{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        return deleteAssemblyUseCase.execute(slug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    @PostMapping("{slug}/components")
    public ResponseEntity<AssemblyComponentResource> addComponent(
            @PathVariable String slug,
            @RequestBody AddAssemblyComponentRequest request) {
        return addAssemblyComponentUseCase.execute(slug, request)
            .map(c -> ResponseEntity.status(HttpStatus.CREATED).<AssemblyComponentResource>body(c))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<AssemblyComponentResource> updateComponent(
            @PathVariable String slug,
            @PathVariable String componentSlug,
            @RequestBody UpdateAssemblyComponentRequest request) {
        return ResponseEntity.of(
            updateAssemblyComponentUseCase.execute(slug, componentSlug, request));
    }

    @DeleteMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<Void> deleteComponent(
            @PathVariable String slug,
            @PathVariable String componentSlug) {
        return deleteAssemblyComponentUseCase.execute(slug, componentSlug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }
}
