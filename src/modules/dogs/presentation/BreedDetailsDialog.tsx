import { Dialog } from "radix-ui";

import type { BreedDetails } from "@/types/dog";
import { CloseIcon } from "@/modules/dogs/presentation/icons";

interface BreedDetailsDialogProps {
  breed: BreedDetails;
  children: React.ReactNode;
}

export function BreedDetailsDialog({ breed, children }: BreedDetailsDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{breed.name}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="dialog-close" aria-label="Close">
                <CloseIcon />
              </button>
            </Dialog.Close>
          </div>

          {breed.description && <p className="dialog-description">{breed.description}</p>}

          <dl className="dialog-facts">
            {breed.breedGroup && (
              <div className="dialog-fact">
                <dt>Group</dt>
                <dd>{breed.breedGroup}</dd>
              </div>
            )}
            {breed.lifeSpan && (
              <div className="dialog-fact">
                <dt>Life span</dt>
                <dd>{breed.lifeSpan} years</dd>
              </div>
            )}
            {breed.weight && (
              <div className="dialog-fact">
                <dt>Weight</dt>
                <dd>{breed.weight.metric} kg</dd>
              </div>
            )}
            {breed.height && (
              <div className="dialog-fact">
                <dt>Height</dt>
                <dd>{breed.height.metric} cm</dd>
              </div>
            )}
            {breed.bredFor && (
              <div className="dialog-fact">
                <dt>Bred for</dt>
                <dd>{breed.bredFor}</dd>
              </div>
            )}
            {breed.origin && (
              <div className="dialog-fact">
                <dt>Origin</dt>
                <dd>{breed.origin}</dd>
              </div>
            )}
          </dl>

          {breed.history && (
            <div className="dialog-history">
              <h4>History</h4>
              <p>{breed.history}</p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
