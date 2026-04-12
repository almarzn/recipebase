//
// @Injectable()
// export class RecipeVariantEditViewModel {
//   private readonly recipeEditVm: RecipeEditViewModel;
//
//   readonly variant;
//   readonly recipe;
//
//   constructor(readonly variantSlug: Signal<string>) {
//     this.recipeEditVm = inject(RecipeEditViewModel);
//     this.variant = computed(() => this.recipeEditVm.variants().find(v => v.slug === this.variantSlug()));
//     this.recipe = this.recipeEditVm.recipe;
//   }
// }
//
// export const provideRecipeVariantEditViewModel = () => ({
//   provide: RecipeEditViewModel,
//   useFactory: () => {
//     const route = inject(ActivatedRoute);
//
//     return new RecipeVariantEditViewModel(
//       toSignal(
//         route.params.pipe(
//           map(params => params['variantSlug'])
//         )
//       )
//     )
//   }
// })
